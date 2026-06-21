import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@sccoo/db';

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
        title,
        content,
        type,
        categoryId: categoryId || 2,
        cityId,
        userId: session.user.id,
        priceMin,
        priceMax,
        contactName,
        contactPhone,
        contactWechat,
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
