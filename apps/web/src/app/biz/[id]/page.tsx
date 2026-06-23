import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@sccoo/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Phone, MapPin, Globe, Calendar, Verified, User, ChevronRight } from 'lucide-react';
import { POST_TYPE_LABELS } from '@sccoo/shared';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

interface Props {
  params: Promise<{ id: string }>;
}

export default async function BusinessDetailPage({ params }: Props) {
  const { id } = await params;
  const bizId = parseInt(id);
  if (isNaN(bizId)) notFound();

  const business = await prisma.business.findUnique({
    where: { id: bizId },
    include: {
      city: { select: { name: true } },
      posts: {
        where: { status: 'PUBLISHED' },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { category: { select: { name: true } } },
      },
      artists: {
        include: { city: { select: { name: true } } },
      },
    },
  });

  if (!business) notFound();

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-red-600">首页</Link>
        {' > '}
        <Link href="/biz119/" className="hover:text-red-600">纹身店大全</Link>
        {' > '}
        <span className="text-gray-900">{business.name}</span>
      </div>

      {/* Header */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 bg-red-100 rounded-xl flex items-center justify-center text-4xl font-bold text-red-600 shrink-0">
              {business.name.charAt(0)}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold flex items-center gap-2">
                {business.name}
                {business.isVerified && <Verified className="h-5 w-5 text-blue-500" />}
              </h1>
              <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600">
                {business.phone && (
                  <span className="flex items-center gap-1"><Phone className="h-4 w-4" /> {business.phone}</span>
                )}
                <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {business.city.name} {business.address}</span>
                {business.website && (
                  <span className="flex items-center gap-1"><Globe className="h-4 w-4" /> {business.website}</span>
                )}
                <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> {business.createdAt.toLocaleDateString('zh-CN')} 入驻</span>
              </div>
              {business.description && (
                <p className="mt-3 text-gray-700">{business.description}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Artists */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5" /> 纹身师
            </CardTitle>
          </CardHeader>
          <CardContent>
            {business.artists.length === 0 ? (
              <p className="text-gray-400 text-sm">暂无纹身师信息</p>
            ) : (
              <div className="space-y-3">
                {business.artists.map((artist) => (
                  <div key={artist.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-500">
                      {artist.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium">{artist.name}</p>
                      <p className="text-xs text-gray-400">{artist.specialty} · {artist.experienceYears}年经验</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Posts */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">该店发布的信息</CardTitle>
          </CardHeader>
          <CardContent>
            {business.posts.length === 0 ? (
              <p className="text-gray-400 text-sm">暂无发布信息</p>
            ) : (
              <div className="space-y-3">
                {business.posts.map((post) => (
                  <Link key={post.id} href={`/xinxi/${post.id}`}>
                    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex-1 min-w-0">
                        <Badge variant="secondary" className="text-xs mb-1">{POST_TYPE_LABELS[post.type] || post.type}</Badge>
                        <p className="font-medium text-sm line-clamp-1">{post.title}</p>
                        <p className="text-xs text-gray-400">{post.createdAt.toLocaleDateString('zh-CN')}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400 shrink-0" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 text-center">
        <Link href="/biz119/" className="text-sm text-gray-500 hover:text-red-600">
          &larr; 返回纹身店大全
        </Link>
      </div>
    </div>
  );
}
