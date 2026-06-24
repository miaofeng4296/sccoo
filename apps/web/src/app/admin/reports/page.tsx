import { auth } from '@/lib/auth';
import { prisma } from '@sccoo/db';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ReportActionsClient } from './ReportActionsClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface Props {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

export default async function AdminReportsPage({ searchParams }: Props) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') redirect('/login/');

  const params = await searchParams;
  const page = parseInt(params.page || '1');
  const filter = params.filter || 'pending';
  const limit = 30;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (filter === 'pending') {
    where.status = 'PENDING';
  } else if (filter === 'resolved') {
    where.status = 'RESOLVED';
  } else if (filter === 'dismissed') {
    where.status = 'DISMISSED';
  }

  const [reports, total, pendingCount] = await Promise.all([
    prisma.report.findMany({
      where,
      include: {
        user: { select: { id: true, name: true } },
        post: { select: { id: true, title: true, status: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.report.count({ where }),
    prisma.report.count({ where: { status: 'PENDING' } }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">
          举报管理
          {pendingCount > 0 && <Badge variant="destructive" className="ml-2">{pendingCount} 待处理</Badge>}
        </h1>
        <Link href="/admin"><Button variant="outline" size="sm">返回后台</Button></Link>
      </div>

      <div className="flex gap-2 mb-4">
        <Link href="/admin/reports?filter=pending">
          <Badge variant={filter === 'pending' ? 'destructive' : 'outline'} className="cursor-pointer">待处理</Badge>
        </Link>
        <Link href="/admin/reports?filter=resolved">
          <Badge variant={filter === 'resolved' ? 'default' : 'outline'} className="cursor-pointer">已处理</Badge>
        </Link>
        <Link href="/admin/reports?filter=dismissed">
          <Badge variant={filter === 'dismissed' ? 'secondary' : 'outline'} className="cursor-pointer">已忽略</Badge>
        </Link>
        <Link href="/admin/reports?filter=all">
          <Badge variant={filter === 'all' ? 'default' : 'outline'} className="cursor-pointer">全部</Badge>
        </Link>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left bg-gray-50">
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">举报人</th>
                  <th className="py-3 px-4">被举报信息</th>
                  <th className="py-3 px-4">信息状态</th>
                  <th className="py-3 px-4">原因</th>
                  <th className="py-3 px-4">状态</th>
                  <th className="py-3 px-4">时间</th>
                  <th className="py-3 px-4">操作</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((r) => (
                  <tr key={r.id} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-4 text-xs">{r.id}</td>
                    <td className="py-2 px-4 text-xs">{r.user.name}</td>
                    <td className="py-2 px-4 text-xs">
                      {r.post ? (
                        <Link href={`/xinxi/${r.post.id}`} className="text-blue-600 hover:underline">
                          {r.post.title.slice(0, 20)}...
                        </Link>
                      ) : (
                        <span className="text-gray-400">信息已删除</span>
                      )}
                    </td>
                    <td className="py-2 px-4">
                      {r.post && (
                        <Badge variant={r.post.status === 'PUBLISHED' ? 'default' : 'secondary'} className="text-xs">
                          {r.post.status === 'PUBLISHED' ? '已发布' : r.post.status === 'EXPIRED' ? '已过期' : r.post.status}
                        </Badge>
                      )}
                    </td>
                    <td className="py-2 px-4 text-xs max-w-[150px] truncate">
                      {r.reason || '未填写'}
                    </td>
                    <td className="py-2 px-4">
                      <Badge
                        variant={
                          r.status === 'PENDING' ? 'destructive' :
                          r.status === 'RESOLVED' ? 'default' : 'secondary'
                        }
                        className="text-xs"
                      >
                        {r.status === 'PENDING' ? '待处理' : r.status === 'RESOLVED' ? '已处理' : '已忽略'}
                      </Badge>
                    </td>
                    <td className="py-2 px-4 text-xs text-gray-400">
                      {r.createdAt.toLocaleDateString('zh-CN')}
                    </td>
                    <td className="py-2 px-4">
                      <ReportActionsClient
                        reportId={r.id}
                        postId={r.post?.id || 0}
                        currentStatus={r.status}
                      />
                    </td>
                  </tr>
                ))}
                {reports.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center text-gray-400 py-8">暂无举报记录</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {page > 1 && (
            <Link href={`/admin/reports?filter=${filter}&page=${page - 1}`}>
              <Button variant="outline" size="sm">上一页</Button>
            </Link>
          )}
          <span className="text-sm text-gray-500 py-2 px-4">第 {page} / {totalPages} 页</span>
          {page < totalPages && (
            <Link href={`/admin/reports?filter=${filter}&page=${page + 1}`}>
              <Button variant="outline" size="sm">下一页</Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
