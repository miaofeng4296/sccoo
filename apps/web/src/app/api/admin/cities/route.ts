import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@sccoo/db';

export async function GET() {
  const cities = await prisma.city.findMany({ orderBy: { sortOrder: 'asc' }, include: { parent: { select: { name: true } } } });
  return NextResponse.json(cities);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') return NextResponse.json({ error: '无权限' }, { status: 403 });
  const body = await request.json();
  const c = await prisma.city.create({ data: { name: body.name, slug: body.slug, subdomain: body.subdomain, parentId: body.parentId || null, sortOrder: body.sortOrder || 0, isActive: body.isActive ?? true } });
  return NextResponse.json(c, { status: 201 });
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') return NextResponse.json({ error: '无权限' }, { status: 403 });
  const body = await request.json();
  const c = await prisma.city.update({ where: { id: body.id }, data: { ...(body.name && { name: body.name }), ...(body.slug && { slug: body.slug }), ...(body.subdomain && { subdomain: body.subdomain }), ...(body.sortOrder !== undefined && { sortOrder: body.sortOrder }), ...(body.isActive !== undefined && { isActive: body.isActive }), ...(body.parentId !== undefined && { parentId: body.parentId }) } });
  return NextResponse.json(c);
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') return NextResponse.json({ error: '无权限' }, { status: 403 });
  const body = await request.json();
  await prisma.city.delete({ where: { id: body.id } });
  return NextResponse.json({ success: true });
}
