import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@sccoo/db';

// POST: Toggle favorite (add if not exists, remove if exists)
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const body = await request.json();
    const { postId } = body;

    if (!postId) {
      return NextResponse.json({ error: '参数错误' }, { status: 400 });
    }

    const userId = session.user.id;

    // Check if already favorited
    const existing = await prisma.favorite.findUnique({
      where: { userId_postId: { userId, postId } },
    });

    if (existing) {
      // Remove favorite
      await prisma.favorite.delete({ where: { id: existing.id } });
      return NextResponse.json({ favorited: false, message: '已取消收藏' });
    } else {
      // Add favorite
      await prisma.favorite.create({ data: { userId, postId } });
      return NextResponse.json({ favorited: true, message: '收藏成功' });
    }
  } catch {
    return NextResponse.json({ error: '操作失败' }, { status: 500 });
  }
}

// GET: Check if a post is favorited and get count
export async function GET(request: Request) {
  try {
    const session = await auth();
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');

    if (!postId) {
      return NextResponse.json({ error: '参数错误' }, { status: 400 });
    }

    const count = await prisma.favorite.count({
      where: { postId: parseInt(postId) },
    });

    let isFavorited = false;
    if (session?.user) {
      const fav = await prisma.favorite.findUnique({
        where: { userId_postId: { userId: session.user.id, postId: parseInt(postId) } },
      });
      isFavorited = !!fav;
    }

    return NextResponse.json({ count, isFavorited });
  } catch {
    return NextResponse.json({ error: '获取失败' }, { status: 500 });
  }
}
