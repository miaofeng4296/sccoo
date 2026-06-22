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
    const { questionId, content } = body;

    if (!questionId || !content || content.trim().length < 2) {
      return NextResponse.json({ error: '请填写回答内容' }, { status: 400 });
    }

    const answer = await prisma.qaAnswer.create({
      data: {
        questionId,
        content: content.trim(),
        userId: session.user.id,
      },
    });

    // Update answer count
    await prisma.qaQuestion.update({
      where: { id: questionId },
      data: { answerCount: { increment: 1 } },
    });

    return NextResponse.json(answer, { status: 201 });
  } catch (error) {
    console.error('Answer creation error:', error);
    return NextResponse.json({ error: '回答提交失败' }, { status: 500 });
  }
}
