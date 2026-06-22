import { auth } from '@/lib/auth';
import { prisma } from '@sccoo/db';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, FileText, Building2, Eye } from 'lucide-react';

export default async function AdminDashboard() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') redirect('/login/');

  const [totalPosts, totalUsers, totalBusinesses, pendingPosts, recentPosts] = await Promise.all([
    prisma.post.count(),
    prisma.user.count(),
    prisma.business.count(),
    prisma.post.count({ where: { status: 'PENDING' } }),
    prisma.post.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: { city: { select: { name: true } }, user: { select: { name: true } } },
    }),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">管理后台</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <FileText className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-2xl font-bold">{totalPosts}</p>
              <p className="text-sm text-gray-500">信息总数</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <Users className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-2xl font-bold">{totalUsers}</p>
              <p className="text-sm text-gray-500">用户总数</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <Building2 className="h-8 w-8 text-purple-500" />
            <div>
              <p className="text-2xl font-bold">{totalBusinesses}</p>
              <p className="text-sm text-gray-500">商家总数</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <Eye className="h-8 w-8 text-orange-500" />
            <div>
              <p className="text-2xl font-bold">{pendingPosts}</p>
              <p className="text-sm text-gray-500">待审核</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Link href="/admin/posts"><Button variant="outline" className="w-full">信息管理</Button></Link>
        <Link href="/admin/users"><Button variant="outline" className="w-full">用户管理</Button></Link>
        <Link href="/admin/articles"><Button variant="outline" className="w-full">文章管理</Button></Link>
        <Link href="/admin/businesses"><Button variant="outline" className="w-full">商家认证</Button></Link>
        <Link href="/admin/payments"><Button variant="outline" className="w-full">支付管理</Button></Link>
        <Link href="/admin/banners"><Button variant="outline" className="w-full">Banner</Button></Link>
        <Link href="/admin/categories"><Button variant="outline" className="w-full">分类管理</Button></Link>
        <Link href="/admin/cities"><Button variant="outline" className="w-full">城市管理</Button></Link>
        <Link href="/admin/notifications"><Button variant="outline" className="w-full">系统通知</Button></Link>
        <Link href="/"><Button variant="outline" className="w-full">返回首页</Button></Link>
      </div>

      {/* Recent Posts */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">最近发布的信息</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-2">ID</th>
                  <th className="py-2">标题</th>
                  <th className="py-2">发布者</th>
                  <th className="py-2">地区</th>
                  <th className="py-2">状态</th>
                  <th className="py-2">时间</th>
                </tr>
              </thead>
              <tbody>
                {recentPosts.map((post) => (
                  <tr key={post.id} className="border-b hover:bg-gray-50">
                    <td className="py-2">{post.id}</td>
                    <td className="py-2">
                      <Link href={`/xinxi/${post.id}`} className="text-blue-600 hover:underline">
                        {post.title.slice(0, 30)}{post.title.length > 30 ? '...' : ''}
                      </Link>
                    </td>
                    <td className="py-2">{post.user.name}</td>
                    <td className="py-2">{post.city.name}</td>
                    <td className="py-2">
                      <Badge variant={post.status === 'PUBLISHED' ? 'default' : 'outline'} className="text-xs">
                        {post.status}
                      </Badge>
                    </td>
                    <td className="py-2 text-gray-400">{post.createdAt.toLocaleDateString('zh-CN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
