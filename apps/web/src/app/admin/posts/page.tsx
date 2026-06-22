import { auth } from '@/lib/auth';
import { prisma } from '@sccoo/db';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { PAGE_SIZE, POST_TYPE_LABELS } from '@sccoo/shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { PostActionsClient } from './PostActionsClient';

export const revalidate = 0; // No cache for admin

interface Props {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

export default async function AdminPostsPage({ searchParams }: Props) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') redirect('/login/');

  const params = await searchParams;
  const page = params.page ? parseInt(params.page) : 1;
  const statusFilter = params.status || '';

  const where: Record<string, unknown> = {};
  if (statusFilter) where.status = statusFilter;

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      include: {
        city: { select: { name: true } },
        category: { select: { name: true } },
        user: { select: { name: true, email: true } },
        images: { take: 1 },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.post.count({ where }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">信息管理</h1>
          <p className="text-sm text-gray-500 mt-1">共 {total} 条信息</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin" className="text-sm text-gray-500 hover:text-red-600">← 返回仪表盘</Link>
        </div>
      </div>

      {/* Status Filter */}
      <div className="flex gap-2 mb-4">
        <Link href="/admin/posts">
          <Badge variant={!statusFilter ? 'secondary' : 'outline'} className="cursor-pointer">全部</Badge>
        </Link>
        <Link href="/admin/posts?status=PUBLISHED">
          <Badge variant={statusFilter === 'PUBLISHED' ? 'secondary' : 'outline'} className="cursor-pointer">已发布</Badge>
        </Link>
        <Link href="/admin/posts?status=PENDING">
          <Badge variant={statusFilter === 'PENDING' ? 'secondary' : 'outline'} className="cursor-pointer">待审核</Badge>
        </Link>
        <Link href="/admin/posts?status=REJECTED">
          <Badge variant={statusFilter === 'REJECTED' ? 'secondary' : 'outline'} className="cursor-pointer">已拒绝</Badge>
        </Link>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-left">
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">标题/内容</th>
                  <th className="py-3 px-4">类型</th>
                  <th className="py-3 px-4">发布者</th>
                  <th className="py-3 px-4">地区</th>
                  <th className="py-3 px-4">状态</th>
                  <th className="py-3 px-4">时间</th>
                  <th className="py-3 px-4">操作</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr key={post.id} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-4 text-gray-500">{post.id}</td>
                    <td className="py-2 px-4 max-w-xs">
                      <Link href={`/xinxi/${post.id}`} className="text-blue-600 hover:underline font-medium line-clamp-1">
                        {post.title}
                      </Link>
                      <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">{post.content}</p>
                    </td>
                    <td className="py-2 px-4">
                      <Badge variant="outline" className="text-xs">{POST_TYPE_LABELS[post.type] || post.type}</Badge>
                    </td>
                    <td className="py-2 px-4 text-xs">{post.user.name}<br /><span className="text-gray-400">{post.user.email}</span></td>
                    <td className="py-2 px-4 text-xs">{post.city.name}</td>
                    <td className="py-2 px-4">
                      <Badge variant={
                        post.status === 'PUBLISHED' ? 'default' :
                        post.status === 'PENDING' ? 'secondary' : 'destructive'
                      } className="text-xs">
                        {post.status === 'PUBLISHED' ? '已发布' :
                         post.status === 'PENDING' ? '待审核' :
                         post.status === 'REJECTED' ? '已拒绝' : post.status}
                      </Badge>
                    </td>
                    <td className="py-2 px-4 text-xs text-gray-400">{post.createdAt.toLocaleDateString('zh-CN')}</td>
                    <td className="py-2 px-4">
                      <PostActionsClient postId={post.id} currentStatus={post.status} />
                    </td>
                  </tr>
                ))}
                {posts.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-gray-400">暂无信息</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href={`/admin/posts?${statusFilter ? 'status=' + statusFilter + '&' : ''}page=${page - 1}`}
                  className={page <= 1 ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
              {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => {
                const p = i + 1;
                const qs = statusFilter ? `status=${statusFilter}&page=${p}` : `page=${p}`;
                return (
                  <PaginationItem key={p}>
                    <PaginationLink href={`/admin/posts?${qs}`} isActive={p === page}>{p}</PaginationLink>
                  </PaginationItem>
                );
              })}
              <PaginationItem>
                <PaginationNext
                  href={`/admin/posts?${statusFilter ? 'status=' + statusFilter + '&' : ''}page=${page + 1}`}
                  className={page >= totalPages ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
