import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@sccoo/db';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const body = await request.json();
    const { postId, reason } = body;

    if (!postId) {
      return NextResponse.json({ error: '参数错误' }, { status: 400 });
    }

    // Check if already reported by this user
    const existing = await prisma.report.findFirst({
      where: { postId, userId: session.user.id as string },
    });

    if (existing) {
      return NextResponse.json({ success: true, message: '您已举报过该信息，我们会尽快处理' });
    }

    await prisma.report.create({
      data: {
        postId,
        userId: session.user.id as string,
        reason: reason || null,
        status: 'PENDING',
      },
    });

    return NextResponse.json({ success: true, message: '举报已提交，我们会尽快处理' });
  } catch (error) {
    console.error('Report error:', error);
    return NextResponse.json({ error: '举报提交失败' }, { status: 500 });
  }
}
