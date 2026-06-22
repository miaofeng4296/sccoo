import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@sccoo/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (id) {
    const post = await prisma.post.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true, title: true, content: true, type: true, isPinned: true,
        priceMin: true, priceMax: true,
        contactName: true, contactPhone: true, contactWechat: true,
        cityId: true, categoryId: true,
      },
    });
    if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(post);
  }
  return NextResponse.json({ error: 'id required' }, { status: 400 });
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const body = await request.json();
    const { title, content, type, categoryId, cityId, priceMin, priceMax, contactName, contactPhone, contactWechat, images, expiresAt } = body;

    if (!title || !content || !type || !cityId) {
      return NextResponse.json({ error: '请填写标题、内容、类型和地区' }, { status: 400 });
    }

    const post = await prisma.post.create({
      data: {
        title, content, type,
        categoryId: categoryId || 2, cityId,
        userId: session.user.id,
        priceMin, priceMax,
        contactName, contactPhone, contactWechat,
        status: 'PUBLISHED',
        expiresAt: new Date(expiresAt || Date.now() + 30 * 24 * 60 * 60 * 1000),
        images: images?.length ? { create: images.map((url: string, i: number) => ({ url, sortOrder: i })) } : undefined,
      },
    });

    return NextResponse.json({ id: post.id }, { status: 201 });
  } catch (error) {
    console.error('Post creation error:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}

// PATCH: Update a post (owner only)
export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const body = await request.json();
    const { id, title, content, priceMin, priceMax, contactName, contactPhone, contactWechat } = body;

    if (!id) {
      return NextResponse.json({ error: '参数错误' }, { status: 400 });
    }

    // Verify ownership
    const post = await prisma.post.findUnique({ where: { id } });
    if (!post || post.userId !== session.user.id) {
      return NextResponse.json({ error: '无权操作' }, { status: 403 });
    }

    const updated = await prisma.post.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(content && { content }),
        priceMin: priceMin ?? null,
        priceMax: priceMax ?? null,
        contactName: contactName ?? null,
        contactPhone: contactPhone ?? null,
        contactWechat: contactWechat ?? null,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Post update error:', error);
    return NextResponse.json({ error: '更新失败' }, { status: 500 });
  }
}

// DELETE: Delete a post (owner only)
export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: '参数错误' }, { status: 400 });
    }

    // Verify ownership
    const post = await prisma.post.findUnique({ where: { id } });
    if (!post || post.userId !== session.user.id) {
      return NextResponse.json({ error: '无权操作' }, { status: 403 });
    }

    await prisma.post.update({
      where: { id },
      data: { status: 'EXPIRED' },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Post delete error:', error);
    return NextResponse.json({ error: '删除失败' }, { status: 500 });
  }
}
