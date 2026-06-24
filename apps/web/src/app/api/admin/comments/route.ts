import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@sccoo/db';

export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '无权限' }, { status: 403 });
    }

    const body = await request.json();
    const { id, isDeleted } = body as { id?: number; isDeleted?: boolean };

    if (!id) {
      return NextResponse.json({ error: '缺少评论ID' }, { status: 400 });
    }

    const comment = await prisma.comment.update({
      where: { id },
      data: { isDeleted: isDeleted ?? true },
    });

    return NextResponse.json(comment);
  } catch (error) {
    console.error('Admin comment PATCH error:', error);
    return NextResponse.json({ error: '操作失败' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '无权限' }, { status: 403 });
    }

    const body = await request.json();
    const { id } = body as { id?: number };

    if (!id) {
      return NextResponse.json({ error: '缺少评论ID' }, { status: 400 });
    }

    await prisma.comment.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin comment DELETE error:', error);
    return NextResponse.json({ error: '删除失败' }, { status: 500 });
  }
}
