import { z } from 'zod';
import { prisma } from '@sccoo/db';
import { PostStatus, PAGE_SIZE } from '@sccoo/shared';
import { router, publicProcedure, protectedProcedure } from '../trpc';

export const postRouter = router({
  // List posts (public)
  list: publicProcedure
    .input(z.object({
      type: z.string().optional(),
      categoryId: z.number().optional(),
      cityId: z.number().optional(),
      query: z.string().optional(),
      page: z.number().default(1),
      pageSize: z.number().default(PAGE_SIZE),
    }))
    .query(async ({ input }) => {
      const where: Record<string, unknown> = { status: PostStatus.PUBLISHED };
      if (input.type) where.type = input.type;
      if (input.categoryId) where.categoryId = input.categoryId;
      if (input.cityId) where.cityId = input.cityId;
      if (input.query) {
        where.OR = [
          { title: { contains: input.query } },
          { content: { contains: input.query } },
        ];
      }

      const [posts, total] = await Promise.all([
        prisma.post.findMany({
          where,
          include: {
            images: { orderBy: { sortOrder: 'asc' }, take: 1 },
            city: { select: { id: true, name: true } },
            category: { select: { id: true, name: true } },
          },
          orderBy: [
            { isPinned: 'desc' },
            { pinExpiresAt: { sort: 'desc', nulls: 'last' } },
            { createdAt: 'desc' },
          ],
          skip: (input.page - 1) * input.pageSize,
          take: input.pageSize,
        }),
        prisma.post.count({ where }),
      ]);

      return { posts, total, totalPages: Math.ceil(total / input.pageSize) };
    }),

  // Get post detail (public)
  byId: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const post = await prisma.post.update({
        where: { id: input.id },
        data: { viewCount: { increment: 1 } },
        include: {
          images: { orderBy: { sortOrder: 'asc' } },
          city: { select: { id: true, name: true } },
          category: { select: { id: true, name: true } },
          user: { select: { id: true, name: true, avatar: true } },
        },
      });
      return post;
    }),

  // Create post (requires login)
  create: protectedProcedure
    .input(z.object({
      title: z.string().min(2).max(200),
      content: z.string().min(10),
      type: z.string(),
      categoryId: z.number(),
      cityId: z.number(),
      priceMin: z.number().optional(),
      priceMax: z.number().optional(),
      contactName: z.string().optional(),
      contactPhone: z.string().optional(),
      contactWechat: z.string().optional(),
      images: z.array(z.string()).optional(),
      expiresAt: z.date(),
    }))
    .mutation(async ({ input, ctx }) => {
      const post = await prisma.post.create({
        data: {
          title: input.title,
          content: input.content,
          type: input.type,
          categoryId: input.categoryId,
          cityId: input.cityId,
          userId: ctx.session!.user.id,
          priceMin: input.priceMin,
          priceMax: input.priceMax,
          contactName: input.contactName,
          contactPhone: input.contactPhone,
          contactWechat: input.contactWechat,
          status: PostStatus.PUBLISHED,
          expiresAt: input.expiresAt,
          images: input.images ? {
            create: input.images.map((url, i) => ({ url, sortOrder: i })),
          } : undefined,
        },
      });
      return post;
    }),

  // Pin post (requires login, payment placeholder)
  pin: protectedProcedure
    .input(z.object({
      postId: z.number(),
      pinType: z.enum(['LARGE_TOP', 'MEDIUM_TOP', 'SMALL_TOP']),
      pinDays: z.number(),
    }))
    .mutation(async ({ input, ctx }) => {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + input.pinDays);

      const post = await prisma.post.update({
        where: { id: input.postId, userId: ctx.session!.user.id },
        data: {
          isPinned: true,
          pinType: input.pinType,
          pinExpiresAt: expiresAt,
        },
      });
      return post;
    }),
});
