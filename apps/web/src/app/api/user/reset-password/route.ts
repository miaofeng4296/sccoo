import { NextResponse } from 'next/server';
import { prisma } from '@sccoo/db';
import { hash } from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { email, newPassword } = await request.json();
    if (!email || !newPassword || newPassword.length < 6) {
      return NextResponse.json({ error: '参数不正确' }, { status: 400 });
    }

    const user = await prisma.user.findFirst({ where: { email } });
    if (!user) return NextResponse.json({ error: '用户不存在' }, { status: 404 });

    const passwordHash = await hash(newPassword, 10);
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: '重置失败' }, { status: 500 });
  }
}
