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
    const { title, url, logo, sortOrder, isActive } = body;

    if (!title || !url) {
      return NextResponse.json({ error: '标题和URL不能为空' }, { status: 400 });
    }

    const link = await prisma.link.create({
      data: { title, url, logo: logo || null, sortOrder: sortOrder || 0, isActive: isActive ?? true },
    });

    return NextResponse.json(link, { status: 201 });
  } catch (error) {
    console.error('Link POST error:', error);
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
    const { id, title, url, logo, sortOrder, isActive } = body;

    if (!id) {
      return NextResponse.json({ error: '参数错误' }, { status: 400 });
    }

    const link = await prisma.link.update({
      where: { id },
      data: { title, url, logo, sortOrder, isActive },
    });

    return NextResponse.json(link);
  } catch (error) {
    console.error('Link PATCH error:', error);
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

    if (!id) {
      return NextResponse.json({ error: '参数错误' }, { status: 400 });
    }

    await prisma.link.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Link DELETE error:', error);
    return NextResponse.json({ error: '删除失败' }, { status: 500 });
  }
}
