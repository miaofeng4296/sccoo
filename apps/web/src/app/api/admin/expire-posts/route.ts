import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@sccoo/db';

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '无权限' }, { status: 403 });
    }

    // Expire posts past their expiration date
    const result = await prisma.post.updateMany({
      where: {
        status: 'PUBLISHED',
        expiresAt: { lt: new Date() },
      },
      data: { status: 'EXPIRED' },
    });

    return NextResponse.json({ expired: result.count, message: `已处理 ${result.count} 条过期信息` });
  } catch (error) {
    console.error('Expire posts error:', error);
    return NextResponse.json({ error: '处理失败' }, { status: 500 });
  }
}
