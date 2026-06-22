import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@sccoo/db';

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') return NextResponse.json({ error: '无权限' }, { status: 403 });
  const body = await request.json();
  const b = await prisma.banner.create({ data: { title: body.title, imageUrl: body.imageUrl, linkUrl: body.linkUrl, sortOrder: body.sortOrder || 0, isActive: body.isActive ?? true } });
  return NextResponse.json(b, { status: 201 });
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') return NextResponse.json({ error: '无权限' }, { status: 403 });
  const body = await request.json();
  const b = await prisma.banner.update({ where: { id: body.id }, data: { ...(body.title && { title: body.title }), ...(body.imageUrl !== undefined && { imageUrl: body.imageUrl }), ...(body.linkUrl !== undefined && { linkUrl: body.linkUrl }), ...(body.sortOrder !== undefined && { sortOrder: body.sortOrder }), ...(body.isActive !== undefined && { isActive: body.isActive }) } });
  return NextResponse.json(b);
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') return NextResponse.json({ error: '无权限' }, { status: 403 });
  const body = await request.json();
  await prisma.banner.delete({ where: { id: body.id } });
  return NextResponse.json({ success: true });
}
