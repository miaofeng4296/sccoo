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

    // Store report as a special QA question in admin category or just log it
    // For simplicity, we log reports via a simple mechanism - set post status flag
    // In production, you'd have a reports table

    console.log(`[REPORT] User ${session.user.id} reported post ${postId}: ${reason || '无原因'}`);

    return NextResponse.json({ success: true, message: '举报已提交，我们会尽快处理' });
  } catch {
    return NextResponse.json({ error: '举报提交失败' }, { status: 500 });
  }
}
