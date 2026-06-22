import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@sccoo/db';

export async function GET() {
  const cats = await prisma.category.findMany({ orderBy: { sortOrder: 'asc' } });
  return NextResponse.json(cats);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') return NextResponse.json({ error: '无权限' }, { status: 403 });
  const body = await request.json();
  const c = await prisma.category.create({ data: { name: body.name, slug: body.slug, sortOrder: body.sortOrder || 0, parentId: body.parentId || null } });
  return NextResponse.json(c, { status: 201 });
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') return NextResponse.json({ error: '无权限' }, { status: 403 });
  const body = await request.json();
  const c = await prisma.category.update({ where: { id: body.id }, data: { ...(body.name && { name: body.name }), ...(body.slug && { slug: body.slug }), ...(body.sortOrder !== undefined && { sortOrder: body.sortOrder }), ...(body.parentId !== undefined && { parentId: body.parentId }) } });
  return NextResponse.json(c);
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') return NextResponse.json({ error: '无权限' }, { status: 403 });
  const body = await request.json();
  await prisma.category.delete({ where: { id: body.id } });
  return NextResponse.json({ success: true });
}
