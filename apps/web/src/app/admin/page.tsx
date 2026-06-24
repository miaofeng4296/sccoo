import { auth } from '@/lib/auth';
import { prisma } from '@sccoo/db';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, FileText, Building2, Eye, TrendingUp, DollarSign, MessageSquare, Flag } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') redirect('/login/');

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [
    totalPosts, totalUsers, totalBusinesses, pendingPosts,
    todayPosts, weekPosts, totalPayments, totalArticleViews,
    recentPosts, popularCategories, topCities,
    pendingReports, pendingComments,
  ] = await Promise.all([
    prisma.post.count(),
    prisma.user.count(),
    prisma.business.count(),
    prisma.post.count({ where: { status: 'PENDING' } }),
    prisma.post.count({ where: { createdAt: { gte: today } } }),
    prisma.post.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.payment.aggregate({ where: { status: 'PAID' }, _sum: { amount: true }, _count: true }),
    prisma.article.aggregate({ _sum: { viewCount: true }, where: { isPublished: true } }),
    prisma.post.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: { city: { select: { name: true } }, user: { select: { name: true } } },
    }),
    // Popular categories
    prisma.post.groupBy({ by: ['categoryId'], where: { status: 'PUBLISHED' }, _count: true, orderBy: { _count: { id: 'desc' } }, take: 5 }),
    // Top cities
    prisma.post.groupBy({ by: ['cityId'], where: { status: 'PUBLISHED' }, _count: true, orderBy: { _count: { id: 'desc' } }, take: 5 }),
    // Pending reports count
    prisma.report.count({ where: { status: 'PENDING' } }),
    // Comment count
    prisma.comment.count(),
  ]);

  // Resolve category names
  const catIds = popularCategories.map((c) => c.categoryId);
  const maxCatCount = Math.max(...popularCategories.map((c) => c._count), 1);

  // Resolve city names
  const cityIds = topCities.map((c) => c.cityId);
  const maxCityCount = Math.max(...topCities.map((c) => c._count), 1);

  const [categories, cities] = await Promise.all([
    catIds.length > 0
      ? prisma.category.findMany({ where: { id: { in: catIds } }, select: { id: true, name: true } })
      : Promise.resolve([]),
    cityIds.length > 0
      ? prisma.city.findMany({ where: { id: { in: cityIds } }, select: { id: true, name: true } })
      : Promise.resolve([]),
  ]);
  const catNameMap = new Map(categories.map((c) => [c.id, c.name]));
  const cityNameMap = new Map(cities.map((c) => [c.id, c.name]));

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">管理后台</h1>

      {/* Stats Row 1 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
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
              <p className="text-sm text-gray-500">待审核信息</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats Row 2 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <TrendingUp className="h-8 w-8 text-cyan-500" />
            <div>
              <p className="text-2xl font-bold">{todayPosts}</p>
              <p className="text-sm text-gray-500">今日新增</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <TrendingUp className="h-8 w-8 text-indigo-500" />
            <div>
              <p className="text-2xl font-bold">{weekPosts}</p>
              <p className="text-sm text-gray-500">本周新增</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <DollarSign className="h-8 w-8 text-emerald-500" />
            <div>
              <p className="text-2xl font-bold">¥{(totalPayments._sum.amount || 0) / 100}</p>
              <p className="text-sm text-gray-500">支付总额 ({totalPayments._count}笔)</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <Eye className="h-8 w-8 text-rose-500" />
            <div>
              <p className="text-2xl font-bold">{totalArticleViews._sum.viewCount || 0}</p>
              <p className="text-sm text-gray-500">文章总浏览量</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Popular Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">热门信息分类 Top 5</CardTitle>
          </CardHeader>
          <CardContent>
            {popularCategories.length === 0 ? (
              <p className="text-sm text-gray-400">暂无数据</p>
            ) : (
              <div className="space-y-3">
                {popularCategories.map((c) => (
                  <div key={c.categoryId} className="flex items-center gap-3">
                    <span className="text-sm w-20 truncate">{catNameMap.get(c.categoryId) || `#${c.categoryId}`}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                      <div
                        className="bg-red-500 h-full rounded-full flex items-center justify-end px-2"
                        style={{ width: `${Math.max((c._count / maxCatCount) * 100, 5)}%` }}
                      >
                        <span className="text-white text-xs font-medium">{c._count}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Cities */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">热门城市 Top 5</CardTitle>
          </CardHeader>
          <CardContent>
            {topCities.length === 0 ? (
              <p className="text-sm text-gray-400">暂无数据</p>
            ) : (
              <div className="space-y-3">
                {topCities.map((c) => (
                  <div key={c.cityId} className="flex items-center gap-3">
                    <span className="text-sm w-20 truncate">{cityNameMap.get(c.cityId) || `#${c.cityId}`}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                      <div
                        className="bg-blue-500 h-full rounded-full flex items-center justify-end px-2"
                        style={{ width: `${Math.max((c._count / maxCityCount) * 100, 5)}%` }}
                      >
                        <span className="text-white text-xs font-medium">{c._count}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
        <Link href="/admin/comments">
          <Button variant="outline" className="w-full flex items-center gap-1">
            <MessageSquare className="h-3 w-3" /> 评论管理
          </Button>
        </Link>
        <Link href="/admin/reports">
          <Button variant="outline" className="w-full flex items-center gap-1">
            <Flag className="h-3 w-3" />
            举报管理
            {pendingReports > 0 && <Badge variant="destructive" className="text-xs ml-1">{pendingReports}</Badge>}
          </Button>
        </Link>
        <Link href="/admin/links"><Button variant="outline" className="w-full">友链管理</Button></Link>
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
