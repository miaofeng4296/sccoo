import { auth } from '@/lib/auth';
import { prisma } from '@sccoo/db';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { VerifyButton } from './VerifyButton';

export const revalidate = 0;

export default async function AdminBusinessesPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') redirect('/login/');

  const businesses = await prisma.business.findMany({
    include: { city: { select: { name: true } }, user: { select: { name: true, email: true } } },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">商家管理</h1>
        <Link href="/admin" className="text-sm text-gray-500 hover:text-red-600">← 返回</Link>
      </div>
      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-left">
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">店铺名</th>
                <th className="py-3 px-4">电话</th>
                <th className="py-3 px-4">地区</th>
                <th className="py-3 px-4">申请人</th>
                <th className="py-3 px-4">状态</th>
                <th className="py-3 px-4">时间</th>
                <th className="py-3 px-4">操作</th>
              </tr>
            </thead>
            <tbody>
              {businesses.map(b => (
                <tr key={b.id} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-4 text-xs">{b.id}</td>
                  <td className="py-2 px-4">
                    <Link href={`/biz/${b.id}`} className="text-blue-600 hover:underline font-medium">{b.name}</Link>
                    {b.description && <p className="text-xs text-gray-400 line-clamp-1">{b.description}</p>}
                  </td>
                  <td className="py-2 px-4 text-xs">{b.phone || '-'}</td>
                  <td className="py-2 px-4 text-xs">{b.city.name}</td>
                  <td className="py-2 px-4 text-xs">{b.user.name}<br /><span className="text-gray-400">{b.user.email}</span></td>
                  <td className="py-2 px-4">
                    <Badge variant={b.isVerified ? 'default' : 'secondary'} className="text-xs">{b.isVerified ? '已认证' : '待审核'}</Badge>
                  </td>
                  <td className="py-2 px-4 text-xs text-gray-400">{b.createdAt.toLocaleDateString('zh-CN')}</td>
                  <td className="py-2 px-4"><VerifyButton bizId={b.id} isVerified={b.isVerified} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
