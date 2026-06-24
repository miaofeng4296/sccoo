import { NextResponse } from 'next/server';
import { prisma } from '@sccoo/db';

export async function GET() {
  try {
    const links = await prisma.link.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
    return NextResponse.json(links);
  } catch (error) {
    console.error('Links GET error:', error);
    return NextResponse.json({ error: '获取友链失败' }, { status: 500 });
  }
}
