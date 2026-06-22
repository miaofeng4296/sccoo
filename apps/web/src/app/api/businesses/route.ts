import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@sccoo/db';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: '请先登录' }, { status: 401 });

    const body = await request.json();
    const { name, phone, address, cityId, description, website } = body;
    if (!name || !cityId) return NextResponse.json({ error: '请填写店名和地区' }, { status: 400 });

    // Check if user already has a business
    const existing = await prisma.business.findFirst({ where: { userId: session.user.id } });
    if (existing) return NextResponse.json({ error: '您已经入驻过了' }, { status: 400 });

    const biz = await prisma.business.create({
      data: { userId: session.user.id, name, phone, address, cityId, description, website, isVerified: false },
    });

    return NextResponse.json(biz, { status: 201 });
  } catch (error) {
    console.error('Business join error:', error);
    return NextResponse.json({ error: '提交失败' }, { status: 500 });
  }
}
