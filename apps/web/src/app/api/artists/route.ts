import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@sccoo/db';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: '请先登录' }, { status: 401 });

    const body = await request.json();
    const { name, specialty, experienceYears, cityId } = body;
    if (!name || !cityId) return NextResponse.json({ error: '请填写姓名和地区' }, { status: 400 });

    const artist = await prisma.artist.create({
      data: { userId: session.user.id, name, specialty, experienceYears, cityId },
    });

    return NextResponse.json(artist, { status: 201 });
  } catch (error) {
    console.error('Artist join error:', error);
    return NextResponse.json({ error: '提交失败' }, { status: 500 });
  }
}
