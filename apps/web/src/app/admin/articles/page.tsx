import { auth } from '@/lib/auth';
import { prisma } from '@sccoo/db';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArticleActionsClient } from './ArticleActionsClient';

export const revalidate = 0;

export default async function AdminArticlesPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') redirect('/login/');

  const [articles, categories] = await Promise.all([
    prisma.article.findMany({
      include: { category: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
    prisma.category.findMany({
      where: { articles: { some: {} } },
      distinct: ['id'],
    }),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">文章管理</h1>
          <p className="text-sm text-gray-500 mt-1">共 {articles.length} 篇文章</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/articles/new">
            <Button size="sm">新增文章</Button>
          </Link>
          <Link href="/admin" className="text-sm text-gray-500 hover:text-red-600">← 返回</Link>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-left">
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">标题</th>
                  <th className="py-3 px-4">分类</th>
                  <th className="py-3 px-4">作者</th>
                  <th className="py-3 px-4">状态</th>
                  <th className="py-3 px-4">浏览</th>
                  <th className="py-3 px-4">时间</th>
                  <th className="py-3 px-4">操作</th>
                </tr>
              </thead>
              <tbody>
                {articles.map((a) => (
                  <tr key={a.id} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-4 text-xs text-gray-400">{a.id}</td>
                    <td className="py-2 px-4">
                      <Link href={`/news/${a.id}`} className="text-blue-600 hover:underline font-medium line-clamp-1">
                        {a.title}
                      </Link>
                    </td>
                    <td className="py-2 px-4"><Badge variant="outline" className="text-xs">{a.category.name}</Badge></td>
                    <td className="py-2 px-4 text-xs">{a.author || '-'}</td>
                    <td className="py-2 px-4">
                      <Badge variant={a.isPublished ? 'default' : 'secondary'} className="text-xs">
                        {a.isPublished ? '已发布' : '草稿'}
                      </Badge>
                    </td>
                    <td className="py-2 px-4 text-xs">{a.viewCount}</td>
                    <td className="py-2 px-4 text-xs text-gray-400">{a.createdAt.toLocaleDateString('zh-CN')}</td>
                    <td className="py-2 px-4">
                      <ArticleActionsClient articleId={a.id} isPublished={a.isPublished} />
                    </td>
                  </tr>
                ))}
                {articles.length === 0 && (
                  <tr><td colSpan={8} className="py-8 text-center text-gray-400">暂无文章</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
