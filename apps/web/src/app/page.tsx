import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export default function HomePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
      {/* Hero Banner Placeholder */}
      <div className="bg-gradient-to-r from-red-500 to-red-700 rounded-xl h-48 md:h-64 flex items-center justify-center text-white">
        <div className="text-center">
          <h1 className="text-2xl md:text-4xl font-bold mb-2">欢迎来到秀酷纹身之家</h1>
          <p className="text-red-100">纹身行业信息平台 — 招聘求职 · 店铺转让 · 二手交易 · 培训学习</p>
        </div>
      </div>

      {/* Category Quick Links */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {[
          { href: '/info122/', label: '招聘求职', color: 'bg-blue-50 text-blue-700 hover:bg-blue-100' },
          { href: '/info153/', label: '我行我秀', color: 'bg-purple-50 text-purple-700 hover:bg-purple-100' },
          { href: '/info4/', label: '纹身店转让', color: 'bg-orange-50 text-orange-700 hover:bg-orange-100' },
          { href: '/info1/', label: '二手设备', color: 'bg-green-50 text-green-700 hover:bg-green-100' },
          { href: '/wenda/', label: '纹身问答', color: 'bg-teal-50 text-teal-700 hover:bg-teal-100' },
          { href: '/info149/', label: '我要纹身', color: 'bg-pink-50 text-pink-700 hover:bg-pink-100' },
          { href: '/info20/', label: '纹身培训', color: 'bg-amber-50 text-amber-700 hover:bg-amber-100' },
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

      {/* Main Content Area — Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Post List Area */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
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
            <CardContent className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 border-b pb-3 last:border-0">
                  <Skeleton className="w-20 h-16 rounded" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <div className="flex gap-2">
                      <Badge variant="secondary" className="text-xs">城市</Badge>
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                  <div className="text-right">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-3 w-12 mt-1" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">网站公告</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                本站主要提供：纹身手稿、纹身店介绍、纹身师招聘、纹身设备转让、
                纹身店转让、纹身店推荐等纹身行业相关信息！
              </p>
              <p className="text-sm text-gray-600 mt-2">
                加入纹身店大全请联系客服微信：sccoocn 或致电 0730-8280318
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">热门商家</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="text-center">
                    <Skeleton className="w-16 h-16 rounded-full mx-auto" />
                    <Skeleton className="h-3 w-16 mx-auto mt-2" />
                    <Skeleton className="h-3 w-20 mx-auto mt-1" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
