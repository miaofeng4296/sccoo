import { NextResponse } from 'next/server';
import { prisma } from '@sccoo/db';

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: { parentId: null }, // Top-level categories only
      select: { id: true, name: true, slug: true },
      orderBy: { sortOrder: 'asc' },
    });
    return NextResponse.json(categories);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}
