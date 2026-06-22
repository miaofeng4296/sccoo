import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@sccoo/db';

export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '无权限' }, { status: 403 });
    }

    const body = await request.json();
    const { paymentId, postId, pinType, pinDays, action } = body;

    if (action === 'confirm') {
      // Confirm payment and pin the post
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + (pinDays || 30));

      await Promise.all([
        prisma.payment.update({
          where: { id: paymentId },
          data: { status: 'PAID', paidAt: new Date() },
        }),
        prisma.post.update({
          where: { id: postId },
          data: {
            isPinned: true,
            pinType: pinType || 'SMALL_TOP',
            pinExpiresAt: expiresAt,
          },
        }),
      ]);

      return NextResponse.json({ success: true });
    } else if (action === 'cancel') {
      await prisma.payment.update({
        where: { id: paymentId },
        data: { status: 'CANCELLED' },
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: '未知操作' }, { status: 400 });
  } catch (error) {
    console.error('Admin payment error:', error);
    return NextResponse.json({ error: '操作失败' }, { status: 500 });
  }
}
