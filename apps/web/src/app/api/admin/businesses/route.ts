import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@sccoo/db';

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') return NextResponse.json({ error: '无权限' }, { status: 403 });

  const body = await request.json();
  const { id, isVerified } = body;
  if (!id) return NextResponse.json({ error: '参数错误' }, { status: 400 });

  await prisma.business.update({ where: { id }, data: { isVerified } });
  return NextResponse.json({ success: true });
}
