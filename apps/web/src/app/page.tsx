import Link from 'next/link';
import { prisma } from '@sccoo/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { POST_TYPE_LABELS, PIN_PRICES } from '@sccoo/shared';

// Dynamic rendering — database not available during Docker build
export const dynamic = 'force-dynamic';
export const revalidate = 60;

export default async function HomePage() {
  // Fetch data in parallel
  const [pinnedPosts, recentPosts, hotBusinesses, articles, banners] = await Promise.all([
    // Pinned posts
    prisma.post.findMany({
      where: { status: 'PUBLISHED', isPinned: true },
      include: { city: { select: { name: true } }, category: { select: { name: true } } },
      orderBy: [{ pinType: 'asc' }, { createdAt: 'desc' }],
      take: 12,
    }),
    // Recent posts
    prisma.post.findMany({
      where: { status: 'PUBLISHED', isPinned: false },
      include: { city: { select: { name: true } }, category: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
    // Hot businesses
    prisma.business.findMany({
      where: { isVerified: true },
      include: { city: { select: { name: true } } },
      take: 8,
    }),
    // Latest articles
    prisma.article.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: 'desc' },
      take: 6,
    }),
    // Banners
    prisma.banner.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      take: 5,
    }),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
      {/* Banner / Hero */}
      {banners.length > 0 ? (
        <div className="bg-gradient-to-r from-red-500 to-red-700 rounded-xl h-48 md:h-64 flex items-center justify-center text-white relative overflow-hidden">
          <div className="text-center z-10 px-4">
            <h1 className="text-2xl md:text-4xl font-bold mb-2">欢迎来到秀酷纹身之家</h1>
            <p className="text-red-100">纹身行业信息平台 — 招聘求职 · 店铺转让 · 二手交易 · 培训学习</p>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-red-500 to-red-700 rounded-xl h-48 md:h-64 flex items-center justify-center text-white">
          <div className="text-center">
            <h1 className="text-2xl md:text-4xl font-bold mb-2">欢迎来到秀酷纹身之家</h1>
            <p className="text-red-100">纹身行业信息平台 — 招聘求职 · 店铺转让 · 二手交易 · 培训学习</p>
          </div>
        </div>
      )}

      {/* Category Quick Links */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {[
          { href: '/info/122/', label: '招聘求职', color: 'bg-blue-50 text-blue-700 hover:bg-blue-100' },
          { href: '/info/153/', label: '我行我秀', color: 'bg-purple-50 text-purple-700 hover:bg-purple-100' },
          { href: '/info/4/', label: '纹身店转让', color: 'bg-orange-50 text-orange-700 hover:bg-orange-100' },
          { href: '/info/1/', label: '二手设备', color: 'bg-green-50 text-green-700 hover:bg-green-100' },
          { href: '/wenda/', label: '纹身问答', color: 'bg-teal-50 text-teal-700 hover:bg-teal-100' },
          { href: '/info/149/', label: '我要纹身', color: 'bg-pink-50 text-pink-700 hover:bg-pink-100' },
          { href: '/info/20/', label: '纹身培训', color: 'bg-amber-50 text-amber-700 hover:bg-amber-100' },
          { href: '/biz119/', label: '纹身店大全', color: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100' },
          { href: '/biz123/', label: '纹身师大全', color: 'bg-rose-50 text-rose-700 hover:bg-rose-100' },
          { href: '/post/', label: '发布信息', color: 'bg-red-50 text-red-700 hover:bg-red-100 font-bold' },
        ].map((cat) => (
          <Link key={cat.href} href={cat.href}>
            <div className={`${cat.color} rounded-lg p-4 text-center transition-colors font-medium`}>
              {cat.label}
            </div>
          </Link>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Posts Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Pinned Posts */}
          {pinnedPosts.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">置顶信息</CardTitle>
                  <Link href="/xinxi/" className="text-sm text-red-600 hover:underline">更多 &rarr;</Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {pinnedPosts.map((post) => (
                    <Link key={post.id} href={`/xinxi/${post.id}`}>
                      <div className="border rounded-lg p-3 hover:border-red-300 hover:shadow-sm transition-all h-full">
                        <div className="flex items-center gap-2 mb-1">
                          {post.pinType && PIN_PRICES[post.pinType as keyof typeof PIN_PRICES] && (
                            <Badge variant="destructive" className="text-xs">
                              {PIN_PRICES[post.pinType as keyof typeof PIN_PRICES].label}
                            </Badge>
                          )}
                          <Badge variant="secondary" className="text-xs">{post.city.name}</Badge>
                        </div>
                        <h3 className="font-medium text-sm line-clamp-2 mb-1">{post.title}</h3>
                        <p className="text-xs text-gray-500 line-clamp-1 mb-2">{post.content}</p>
                        <div className="flex items-center justify-between text-xs text-gray-400">
                          <span>{POST_TYPE_LABELS[post.type] || post.type}</span>
                          {post.priceMin && (
                            <span className="text-red-500 font-medium">
                              ¥{post.priceMin}{post.priceMax && post.priceMax !== post.priceMin ? ` - ${post.priceMax}` : ''}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Posts */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">最新信息</CardTitle>
                <div className="flex gap-2">
                  <Badge variant="secondary" className="cursor-pointer">全部</Badge>
                  <Badge variant="outline" className="cursor-pointer">招聘</Badge>
                  <Badge variant="outline" className="cursor-pointer">转让</Badge>
                  <Badge variant="outline" className="cursor-pointer">培训</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="divide-y">
              {recentPosts.map((post) => (
                <Link key={post.id} href={`/xinxi/${post.id}`}>
                  <div className="flex items-start gap-3 py-3 hover:bg-gray-50 -mx-2 px-2 rounded transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary" className="text-xs shrink-0">
                          {POST_TYPE_LABELS[post.type] || post.type}
                        </Badge>
                        <span className="text-xs text-gray-400">{post.city.name}</span>
                      </div>
                      <h3 className="font-medium text-sm line-clamp-1">{post.title}</h3>
                      <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{post.content}</p>
                    </div>
                    <div className="text-right shrink-0">
                      {post.priceMin ? (
                        <span className="text-red-500 font-medium text-sm whitespace-nowrap">
                          ¥{post.priceMin}{post.priceMax && post.priceMax !== post.priceMin ? `-${post.priceMax}` : ''}
                        </span>
                      ) : null}
                      <p className="text-xs text-gray-400 mt-1">
                        {post.createdAt.toLocaleDateString('zh-CN')}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
              {recentPosts.length === 0 && (
                <p className="text-center text-gray-400 py-8">暂无信息，快来发布第一条吧！</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Site Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">网站公告</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-600 space-y-3">
              <p>本站主要提供：纹身手稿、纹身店介绍、纹身师招聘、纹身设备转让、纹身店转让、纹身店推荐等纹身行业相关信息！</p>
              <p>加入纹身店大全请联系客服微信：<strong>sccoocn</strong> 或致电 <strong>0730-8280318</strong></p>
            </CardContent>
          </Card>

          {/* Latest Articles */}
          {articles.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">最新资讯</CardTitle>
              </CardHeader>
              <CardContent className="divide-y">
                {articles.map((article) => (
                  <Link key={article.id} href={`/news/${article.id}`}>
                    <div className="py-2 hover:text-red-600 transition-colors">
                      <p className="text-sm line-clamp-2">{article.title}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {article.createdAt.toLocaleDateString('zh-CN')}
                      </p>
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Hot Businesses */}
          {hotBusinesses.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">热门商家</CardTitle>
                  <Link href="/biz119/" className="text-xs text-red-600 hover:underline">更多 &rarr;</Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {hotBusinesses.map((biz) => (
                    <Link key={biz.id} href={`/biz/${biz.id}`}>
                      <div className="text-center hover:bg-gray-50 rounded-lg p-2 transition-colors">
                        <div className="w-14 h-14 bg-gray-200 rounded-full mx-auto flex items-center justify-center text-lg font-bold text-gray-500">
                          {biz.name.charAt(0)}
                        </div>
                        <p className="text-sm font-medium mt-1.5 truncate">{biz.name}</p>
                        <p className="text-xs text-gray-400">{biz.city.name}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
