import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@sccoo/db';

type TargetType = 'post' | 'article';

function getTargetConfig(targetType: TargetType, targetId: number) {
  if (targetType === 'post') {
    return {
      where: { postId: targetId },
      createData: (userId: string, content: string, parentId?: number) => ({
        postId: targetId,
        userId,
        content,
        parentId: parentId || null,
      }),
      verifyParent: async (parentId: number) => {
        const parent = await prisma.comment.findUnique({ where: { id: parentId } });
        return parent && parent.postId === targetId;
      },
      errorNoun: '信息',
    };
  }
  return {
    where: { articleId: targetId },
    createData: (userId: string, content: string, parentId?: number) => ({
      articleId: targetId,
      userId,
      content,
      parentId: parentId || null,
    }),
    verifyParent: async (parentId: number) => {
      const parent = await prisma.comment.findUnique({ where: { id: parentId } });
      return parent && parent.articleId === targetId;
    },
    errorNoun: '文章',
  };
}

async function verifyTargetExists(targetType: TargetType, targetId: number): Promise<boolean> {
  if (targetType === 'post') {
    const post = await prisma.post.findUnique({ where: { id: targetId } });
    return !!post;
  }
  const article = await prisma.article.findUnique({ where: { id: targetId } });
  return !!article;
}

export async function handleCommentsGET(
  request: Request,
  targetType: TargetType,
  targetId: number
) {
  try {
    const config = getTargetConfig(targetType, targetId);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
    const skip = (page - 1) * limit;

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where: { ...config.where, parentId: null, isDeleted: false },
        include: {
          user: { select: { id: true, name: true, avatar: true } },
          replies: {
            where: { isDeleted: false },
            include: {
              user: { select: { id: true, name: true, avatar: true } },
            },
            orderBy: { createdAt: 'asc' },
            take: 5,
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.comment.count({ where: { ...config.where, parentId: null, isDeleted: false } }),
    ]);

    return NextResponse.json({
      comments,
      total,
      hasMore: skip + limit < total,
      page,
    });
  } catch (error) {
    console.error(`Comments GET error (${targetType}):`, error);
    return NextResponse.json({ error: '获取评论失败' }, { status: 500 });
  }
}

export async function handleCommentsPOST(
  request: Request,
  targetType: TargetType,
  targetId: number
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const config = getTargetConfig(targetType, targetId);

    const body = await request.json();
    const { content, parentId } = body as { content?: string; parentId?: number };

    if (!content || !content.trim()) {
      return NextResponse.json({ error: '评论内容不能为空' }, { status: 400 });
    }
    if (content.length > 2000) {
      return NextResponse.json({ error: '评论内容不能超过2000字' }, { status: 400 });
    }

    // Verify target exists
    const exists = await verifyTargetExists(targetType, targetId);
    if (!exists) {
      return NextResponse.json({ error: `${config.errorNoun}不存在` }, { status: 404 });
    }

    // If reply, verify parent exists
    if (parentId) {
      const valid = await config.verifyParent(parentId);
      if (!valid) {
        return NextResponse.json({ error: '父评论不存在' }, { status: 400 });
      }
    }

    const comment = await prisma.comment.create({
      data: config.createData(session.user.id as string, content.trim(), parentId),
      include: {
        user: { select: { id: true, name: true, avatar: true } },
      },
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error(`Comment POST error (${targetType}):`, error);
    return NextResponse.json({ error: '评论失败' }, { status: 500 });
  }
}

export async function handleCommentsDELETE(
  request: Request,
  _targetType: TargetType,
  _targetId: number
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const body = await request.json();
    const { commentId } = body as { commentId?: number };

    if (!commentId) {
      return NextResponse.json({ error: '缺少评论ID' }, { status: 400 });
    }

    const comment = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) {
      return NextResponse.json({ error: '评论不存在' }, { status: 404 });
    }

    if (comment.userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '无权操作' }, { status: 403 });
    }

    await prisma.comment.update({
      where: { id: commentId },
      data: { isDeleted: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Comment DELETE error:', error);
    return NextResponse.json({ error: '删除失败' }, { status: 500 });
  }
}
