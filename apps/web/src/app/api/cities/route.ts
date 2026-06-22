import { NextResponse } from 'next/server';
import { prisma } from '@sccoo/db';

export async function GET() {
  try {
    const cities = await prisma.city.findMany({
      where: { isActive: true, parentId: { not: null } }, // Only child cities, not provinces
      select: { id: true, name: true },
      orderBy: { sortOrder: 'asc' },
    });
    return NextResponse.json(cities);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch cities' }, { status: 500 });
  }
}
