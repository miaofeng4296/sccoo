import { auth } from '@/lib/auth';
import { prisma } from '@sccoo/db';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LinkActionsClient } from './LinkActionsClient';
import { LinkCreateForm } from './LinkCreateForm';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminLinksPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') redirect('/login/');

  const links = await prisma.link.findMany({
    orderBy: { sortOrder: 'asc' },
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">友情链接管理</h1>
        <Link href="/admin"><Button variant="outline" size="sm">返回后台</Button></Link>
      </div>

      {/* Add Form */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">添加友链</CardTitle>
        </CardHeader>
        <CardContent>
          <LinkCreateForm />
        </CardContent>
      </Card>

      {/* List */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left bg-gray-50">
                  <th className="py-3 px-4">排序</th>
                  <th className="py-3 px-4">标题</th>
                  <th className="py-3 px-4">URL</th>
                  <th className="py-3 px-4">状态</th>
                  <th className="py-3 px-4">时间</th>
                  <th className="py-3 px-4">操作</th>
                </tr>
              </thead>
              <tbody>
                {links.map((link) => (
                  <tr key={link.id} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-4 text-xs">{link.sortOrder}</td>
                    <td className="py-2 px-4 text-xs font-medium">{link.title}</td>
                    <td className="py-2 px-4 text-xs">
                      <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline max-w-[200px] truncate block">
                        {link.url}
                      </a>
                    </td>
                    <td className="py-2 px-4">
                      <Badge variant={link.isActive ? 'default' : 'secondary'} className="text-xs">
                        {link.isActive ? '启用' : '禁用'}
                      </Badge>
                    </td>
                    <td className="py-2 px-4 text-xs text-gray-400">
                      {link.createdAt.toLocaleDateString('zh-CN')}
                    </td>
                    <td className="py-2 px-4">
                      <LinkActionsClient linkId={link.id} isActive={link.isActive} />
                    </td>
                  </tr>
                ))}
                {links.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center text-gray-400 py-8">暂无友链</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
