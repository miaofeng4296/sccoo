import { auth } from '@/lib/auth';
import { prisma } from '@sccoo/db';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BannerActionsClient } from './BannerActionsClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminBannersPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') redirect('/login/');

  const banners = await prisma.banner.findMany({ orderBy: { sortOrder: 'asc' } });

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Banner 管理</h1>
        <div className="flex gap-2">
          <Link href="/admin/banners/new"><Button size="sm">新增 Banner</Button></Link>
          <Link href="/admin" className="text-sm text-gray-500 hover:text-red-600">← 返回</Link>
        </div>
      </div>
      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="py-3 px-4 text-left">排序</th>
                <th className="py-3 px-4 text-left">标题</th>
                <th className="py-3 px-4 text-left">图片URL</th>
                <th className="py-3 px-4 text-left">链接</th>
                <th className="py-3 px-4 text-left">状态</th>
                <th className="py-3 px-4 text-left">操作</th>
              </tr>
            </thead>
            <tbody>
              {banners.map(b => (
                <tr key={b.id} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-4">{b.sortOrder}</td>
                  <td className="py-2 px-4 font-medium">{b.title}</td>
                  <td className="py-2 px-4 text-xs text-gray-500 max-w-xs truncate">{b.imageUrl}</td>
                  <td className="py-2 px-4 text-xs max-w-xs truncate">{b.linkUrl || '-'}</td>
                  <td className="py-2 px-4"><Badge variant={b.isActive ? 'default' : 'secondary'} className="text-xs">{b.isActive ? '启用' : '禁用'}</Badge></td>
                  <td className="py-2 px-4"><BannerActionsClient banner={b} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
