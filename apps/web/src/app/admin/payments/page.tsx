import { auth } from '@/lib/auth';
import { prisma } from '@sccoo/db';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PaymentActionsClient } from './PaymentActionsClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminPaymentsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') redirect('/login/');

  const payments = await prisma.payment.findMany({
    include: {
      post: { select: { id: true, title: true } },
      user: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  const totalRevenue = payments
    .filter(p => p.status === 'PAID')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">支付管理</h1>
          <p className="text-sm text-gray-500 mt-1">
            共 {payments.length} 笔订单 · 已收 ¥{totalRevenue}
          </p>
        </div>
        <Link href="/admin" className="text-sm text-gray-500 hover:text-red-600">← 返回仪表盘</Link>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-left">
                  <th className="py-3 px-4">订单号</th>
                  <th className="py-3 px-4">金额</th>
                  <th className="py-3 px-4">用户</th>
                  <th className="py-3 px-4">信息</th>
                  <th className="py-3 px-4">置顶类型</th>
                  <th className="py-3 px-4">天数</th>
                  <th className="py-3 px-4">状态</th>
                  <th className="py-3 px-4">时间</th>
                  <th className="py-3 px-4">操作</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-4 font-mono text-xs">{p.orderNo}</td>
                    <td className="py-2 px-4 font-bold text-red-600">¥{p.amount}</td>
                    <td className="py-2 px-4 text-xs">
                      {p.user.name}<br /><span className="text-gray-400">{p.user.email}</span>
                    </td>
                    <td className="py-2 px-4">
                      <Link href={`/xinxi/${p.post.id}`} className="text-blue-600 hover:underline text-xs line-clamp-1">
                        {p.post.title}
                      </Link>
                    </td>
                    <td className="py-2 px-4 text-xs">
                      {p.pinType === 'LARGE_TOP' ? '超大格' : p.pinType === 'MEDIUM_TOP' ? '大格' : '小格'}
                    </td>
                    <td className="py-2 px-4 text-xs">{p.pinDays}天</td>
                    <td className="py-2 px-4">
                      <Badge variant={
                        p.status === 'PAID' ? 'default' :
                        p.status === 'PENDING' ? 'secondary' : 'destructive'
                      } className="text-xs">
                        {p.status === 'PAID' ? '已支付' : p.status === 'PENDING' ? '待支付' : '已取消'}
                      </Badge>
                    </td>
                    <td className="py-2 px-4 text-xs text-gray-400">{p.createdAt.toLocaleDateString('zh-CN')}</td>
                    <td className="py-2 px-4">
                      <PaymentActionsClient paymentId={p.id} postId={p.post.id} status={p.status} pinType={p.pinType} pinDays={p.pinDays} />
                    </td>
                  </tr>
                ))}
                {payments.length === 0 && (
                  <tr><td colSpan={9} className="py-8 text-center text-gray-400">暂无支付订单</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
