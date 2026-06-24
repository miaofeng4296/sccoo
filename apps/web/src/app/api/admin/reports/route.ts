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
    const { id, status } = body as { id?: number; status?: string };

    if (!id || !status) {
      return NextResponse.json({ error: '参数错误' }, { status: 400 });
    }

    const VALID_STATUSES = ['PENDING', 'RESOLVED', 'DISMISSED'];
    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: '无效的状态值' }, { status: 400 });
    }

    const report = await prisma.report.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json(report);
  } catch (error) {
    console.error('Admin report PATCH error:', error);
    return NextResponse.json({ error: '操作失败' }, { status: 500 });
  }
}
