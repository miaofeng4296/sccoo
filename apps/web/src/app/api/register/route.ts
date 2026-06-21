import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { prisma } from '@sccoo/db';

export async function POST(request: Request) {
  try {
    const { email, phone, name, password } = await request.json();

    if (!email && !phone) {
      return NextResponse.json(
        { error: '请填写邮箱或手机号' },
        { status: 400 }
      );
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: '密码至少6位' },
        { status: 400 }
      );
    }

    // Check existing user
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          ...(email ? [{ email }] : []),
          ...(phone ? [{ phone }] : []),
        ],
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: '该邮箱或手机号已被注册' },
        { status: 409 }
      );
    }

    const passwordHash = await hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email: email || null,
        phone: phone || null,
        name: name || '用户',
        passwordHash,
      },
    });

    return NextResponse.json({
      id: user.id,
      email: user.email,
      phone: user.phone,
      name: user.name,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: '服务器错误，请重试' },
      { status: 500 }
    );
  }
}
