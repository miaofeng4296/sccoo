import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@sccoo/db';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const body = await request.json();
    const { postId, pinType, pinDays } = body;

    if (!postId || !pinType || !pinDays) {
      return NextResponse.json({ error: '参数错误' }, { status: 400 });
    }

    // Verify post belongs to user
    const post = await prisma.post.findFirst({
      where: { id: postId, userId: session.user.id },
    });

    if (!post) {
      return NextResponse.json({ error: '信息不存在' }, { status: 404 });
    }

    if (post.isPinned && post.pinExpiresAt && post.pinExpiresAt > new Date()) {
      return NextResponse.json({ error: '该信息已在置顶中' }, { status: 400 });
    }

    const prices: Record<string, number> = {
      LARGE_TOP: 3000,
      MEDIUM_TOP: 1000,
      SMALL_TOP: 200,
    };

    const amount = (prices[pinType] || 200) * (pinDays / 30);

    // Create payment order
    const orderNo = `PAY${Date.now()}${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

    const payment = await prisma.payment.create({
      data: {
        orderNo,
        amount,
        payMethod: 'MANUAL',
        status: 'PENDING',
        postId,
        userId: session.user.id,
        pinType,
        pinDays,
      },
    });

    return NextResponse.json({ id: payment.id, orderNo: payment.orderNo, amount: payment.amount }, { status: 201 });
  } catch (error) {
    console.error('Payment creation error:', error);
    return NextResponse.json({ error: '创建订单失败' }, { status: 500 });
  }
}
