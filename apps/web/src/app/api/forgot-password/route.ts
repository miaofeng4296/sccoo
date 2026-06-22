import { NextResponse } from 'next/server';
import { prisma } from '@sccoo/db';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email) return NextResponse.json({ error: '请输入邮箱' }, { status: 400 });

    const user = await prisma.user.findFirst({ where: { email } });
    if (!user) return NextResponse.json({ error: '该邮箱未注册' }, { status: 404 });

    // Generate reset token (in production, send via email)
    const token = crypto.randomBytes(32).toString('hex');
    console.log(`[PASSWORD RESET] User: ${email}, Token: ${token}`);
    console.log(`[PASSWORD RESET] Reset URL: http://localhost:3000/reset-password?token=${token}&email=${encodeURIComponent(email)}`);

    return NextResponse.json({ message: '重置链接已发送' });
  } catch {
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}
