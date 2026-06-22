import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@sccoo/db';
import { compare, hash } from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword || newPassword.length < 6) {
      return NextResponse.json({ error: '密码格式不正确' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user || !user.passwordHash) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    }

    const isValid = await compare(currentPassword, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: '当前密码不正确' }, { status: 400 });
    }

    const newHash = await hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newHash },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Password change error:', error);
    return NextResponse.json({ error: '修改失败' }, { status: 500 });
  }
}
