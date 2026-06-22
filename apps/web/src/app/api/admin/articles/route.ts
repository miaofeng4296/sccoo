import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@sccoo/db';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '无权限' }, { status: 403 });
    }

    const body = await request.json();
    const { title, content, categoryId, author, coverImage, isPublished } = body;

    if (!title || !content || !categoryId) {
      return NextResponse.json({ error: '请填写标题、内容和分类' }, { status: 400 });
    }

    const article = await prisma.article.create({
      data: {
        title, content, categoryId,
        author: author || '管理员',
        coverImage: coverImage || null,
        isPublished: isPublished ?? true,
      },
    });

    return NextResponse.json(article, { status: 201 });
  } catch (error) {
    console.error('Article creation error:', error);
    return NextResponse.json({ error: '创建失败' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '无权限' }, { status: 403 });
    }

    const body = await request.json();
    const { id, title, content, categoryId, author, coverImage, isPublished } = body;

    if (!id) return NextResponse.json({ error: '参数错误' }, { status: 400 });

    const article = await prisma.article.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(content && { content }),
        ...(categoryId && { categoryId }),
        author: author ?? undefined,
        coverImage: coverImage ?? null,
        isPublished: isPublished ?? undefined,
      },
    });

    return NextResponse.json(article);
  } catch (error) {
    console.error('Article update error:', error);
    return NextResponse.json({ error: '更新失败' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '无权限' }, { status: 403 });
    }

    const body = await request.json();
    const { id } = body;

    if (!id) return NextResponse.json({ error: '参数错误' }, { status: 400 });

    await prisma.article.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Article delete error:', error);
    return NextResponse.json({ error: '删除失败' }, { status: 500 });
  }
}
