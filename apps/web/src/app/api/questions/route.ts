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
    const { title, content } = body;

    if (!title || title.trim().length < 3) {
      return NextResponse.json({ error: '标题至少3个字符' }, { status: 400 });
    }
    if (!content || content.trim().length < 10) {
      return NextResponse.json({ error: '内容至少10个字符' }, { status: 400 });
    }

    const question = await prisma.qaQuestion.create({
      data: {
        title: title.trim(),
        content: content.trim(),
        userId: session.user.id,
      },
    });

    return NextResponse.json(question, { status: 201 });
  } catch (error) {
    console.error('Question creation error:', error);
    return NextResponse.json({ error: '提问失败' }, { status: 500 });
  }
}
