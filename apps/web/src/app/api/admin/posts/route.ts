import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@sccoo/db';

// PATCH: Update post status (approve/reject/delete)
export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '无权限' }, { status: 403 });
    }

    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: '参数错误' }, { status: 400 });
    }

    const post = await prisma.post.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error('Admin post update error:', error);
    return NextResponse.json({ error: '操作失败' }, { status: 500 });
  }
}
