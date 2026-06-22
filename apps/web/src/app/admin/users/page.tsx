import { auth } from '@/lib/auth';
import { prisma } from '@sccoo/db';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { PAGE_SIZE } from '@sccoo/shared';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';

export const revalidate = 0;

interface Props {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

export default async function AdminUsersPage({ searchParams }: Props) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') redirect('/login/');

  const params = await searchParams;
  const page = params.page ? parseInt(params.page) : 1;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        _count: { select: { posts: true, businesses: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.user.count(),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">用户管理</h1>
          <p className="text-sm text-gray-500 mt-1">共 {total} 位用户</p>
        </div>
        <Link href="/admin" className="text-sm text-gray-500 hover:text-red-600">← 返回仪表盘</Link>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-left">
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">用户名</th>
                  <th className="py-3 px-4">邮箱</th>
                  <th className="py-3 px-4">手机号</th>
                  <th className="py-3 px-4">角色</th>
                  <th className="py-3 px-4">发布数</th>
                  <th className="py-3 px-4">商家数</th>
                  <th className="py-3 px-4">注册时间</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-4 text-xs text-gray-400 font-mono">{user.id.slice(0, 8)}...</td>
                    <td className="py-2 px-4 font-medium">{user.name || '未命名'}</td>
                    <td className="py-2 px-4 text-xs">{user.email || '-'}</td>
                    <td className="py-2 px-4 text-xs">{user.phone || '-'}</td>
                    <td className="py-2 px-4">
                      <Badge variant={user.role === 'ADMIN' ? 'destructive' : 'secondary'} className="text-xs">
                        {user.role === 'ADMIN' ? '管理员' : '用户'}
                      </Badge>
                    </td>
                    <td className="py-2 px-4 text-center">{user._count.posts}</td>
                    <td className="py-2 px-4 text-center">{user._count.businesses}</td>
                    <td className="py-2 px-4 text-xs text-gray-400">{user.createdAt.toLocaleDateString('zh-CN')}</td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-gray-400">暂无用户</td>
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
                <PaginationPrevious href={`/admin/users?page=${page - 1}`} className={page <= 1 ? 'pointer-events-none opacity-50' : ''} />
              </PaginationItem>
              {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => {
                const p = i + 1;
                return (
                  <PaginationItem key={p}>
                    <PaginationLink href={`/admin/users?page=${p}`} isActive={p === page}>{p}</PaginationLink>
                  </PaginationItem>
                );
              })}
              <PaginationItem>
                <PaginationNext href={`/admin/users?page=${page + 1}`} className={page >= totalPages ? 'pointer-events-none opacity-50' : ''} />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
