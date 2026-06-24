import { auth } from '@/lib/auth';
import { prisma } from '@sccoo/db';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CommentActionsClient } from './CommentActionsClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface Props {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

export default async function AdminCommentsPage({ searchParams }: Props) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') redirect('/login/');

  const params = await searchParams;
  const page = parseInt(params.page || '1');
  const filter = params.filter || 'all';
  const limit = 30;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (filter === 'deleted') {
    where.isDeleted = true;
  } else if (filter === 'active') {
    where.isDeleted = false;
  }

  const [comments, total] = await Promise.all([
    prisma.comment.findMany({
      where,
      include: {
        user: { select: { id: true, name: true } },
        post: { select: { id: true, title: true } },
        article: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.comment.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">评论管理</h1>
        <Link href="/admin"><Button variant="outline" size="sm">返回后台</Button></Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-4">
        <Link href="/admin/comments?filter=all">
          <Badge variant={filter === 'all' ? 'default' : 'outline'} className="cursor-pointer">
            全部 ({total})
          </Badge>
        </Link>
        <Link href="/admin/comments?filter=active">
          <Badge variant={filter === 'active' ? 'default' : 'outline'} className="cursor-pointer">
            正常
          </Badge>
        </Link>
        <Link href="/admin/comments?filter=deleted">
          <Badge variant={filter === 'deleted' ? 'default' : 'outline'} className="cursor-pointer">
            已删除
          </Badge>
        </Link>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left bg-gray-50">
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">用户</th>
                  <th className="py-3 px-4">来源</th>
                  <th className="py-3 px-4">内容</th>
                  <th className="py-3 px-4">状态</th>
                  <th className="py-3 px-4">时间</th>
                  <th className="py-3 px-4">操作</th>
                </tr>
              </thead>
              <tbody>
                {comments.map((c) => (
                  <tr key={c.id} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-4 text-xs">{c.id}</td>
                    <td className="py-2 px-4 text-xs">{c.user.name}</td>
                    <td className="py-2 px-4 text-xs">
                      {c.post ? (
                        <Link href={`/xinxi/${c.post.id}`} className="text-blue-600 hover:underline">
                          {c.post.title.slice(0, 15)}...
                        </Link>
                      ) : c.article ? (
                        <Link href={`/news/${c.article.id}`} className="text-blue-600 hover:underline">
                          {c.article.title.slice(0, 15)}...
                        </Link>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                      <span className="text-gray-400 ml-1">{c.post ? '(信息)' : '(文章)'}</span>
                    </td>
                    <td className="py-2 px-4 text-xs max-w-xs truncate">{c.content}</td>
                    <td className="py-2 px-4">
                      <Badge variant={c.isDeleted ? 'destructive' : 'default'} className="text-xs">
                        {c.isDeleted ? '已删除' : '正常'}
                      </Badge>
                    </td>
                    <td className="py-2 px-4 text-xs text-gray-400">
                      {c.createdAt.toLocaleDateString('zh-CN')}
                    </td>
                    <td className="py-2 px-4">
                      <CommentActionsClient commentId={c.id} isDeleted={c.isDeleted} />
                    </td>
                  </tr>
                ))}
                {comments.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center text-gray-400 py-8">暂无评论</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {page > 1 && (
            <Link href={`/admin/comments?filter=${filter}&page=${page - 1}`}>
              <Button variant="outline" size="sm">上一页</Button>
            </Link>
          )}
          <span className="text-sm text-gray-500 py-2 px-4">
            第 {page} / {totalPages} 页
          </span>
          {page < totalPages && (
            <Link href={`/admin/comments?filter=${filter}&page=${page + 1}`}>
              <Button variant="outline" size="sm">下一页</Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
