import { auth } from '@/lib/auth';
import { prisma } from '@sccoo/db';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export const revalidate = 0;

export default async function AdminNotificationsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') redirect('/login/');

  const [pendingPosts, pendingPayments, unverifiedBiz, expiredPosts] = await Promise.all([
    prisma.post.count({ where: { status: 'PENDING' } }),
    prisma.payment.count({ where: { status: 'PENDING' } }),
    prisma.business.count({ where: { isVerified: false } }),
    prisma.post.count({ where: { status: 'PUBLISHED', expiresAt: { lt: new Date() } } }),
  ]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">系统通知</h1>
        <Link href="/admin" className="text-sm text-gray-500 hover:text-red-600">← 返回</Link>
      </div>

      <div className="space-y-4">
        {pendingPosts > 0 && (
          <Card className="border-l-4 border-l-yellow-500">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="font-medium">待审核信息</p>
                <p className="text-sm text-gray-500">有 {pendingPosts} 条信息等待审核</p>
              </div>
              <Link href="/admin/posts?status=PENDING"><Button size="sm" variant="outline">去处理</Button></Link>
            </CardContent>
          </Card>
        )}

        {pendingPayments > 0 && (
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="font-medium">待处理支付</p>
                <p className="text-sm text-gray-500">有 {pendingPayments} 笔支付订单待确认</p>
              </div>
              <Link href="/admin/payments"><Button size="sm" variant="outline">去处理</Button></Link>
            </CardContent>
          </Card>
        )}

        {unverifiedBiz > 0 && (
          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="font-medium">待审核商家</p>
                <p className="text-sm text-gray-500">有 {unverifiedBiz} 家商家等待审核</p>
              </div>
              <Link href="/admin/businesses"><Button size="sm" variant="outline">去处理</Button></Link>
            </CardContent>
          </Card>
        )}

        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="font-medium">过期信息清理</p>
              <p className="text-sm text-gray-500">有 {expiredPosts} 条信息已过期，可执行清理</p>
            </div>
            <ExpirePostsButton count={expiredPosts} />
          </CardContent>
        </Card>

        {pendingPosts === 0 && pendingPayments === 0 && unverifiedBiz === 0 && expiredPosts === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-gray-400">
              <p>暂无待处理事项 🎉</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

import { ExpirePostsButton } from './ExpirePostsButton';
