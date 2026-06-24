import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@sccoo/db';
import { POST_TYPE_LABELS } from '@sccoo/shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Eye, MapPin, Phone, Clock } from 'lucide-react';
import { FavoriteButton } from './FavoriteButton';
import { ReportButton } from './ReportButton';
import { CommentSection } from '@/components/comments/CommentSection';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const post = await prisma.post.findUnique({
    where: { id: parseInt(id) },
    select: { title: true, content: true, images: { take: 1, select: { url: true } } },
  });
  if (!post) return { title: '信息不存在 - 秀酷纹身之家' };
  const baseUrl = process.env.NEXTAUTH_URL || 'https://www.sccoo.cn';
  return {
    title: `${post.title} - 秀酷纹身之家`,
    description: post.content.slice(0, 160),
    openGraph: {
      title: post.title,
      description: post.content.slice(0, 160),
      url: `${baseUrl}/xinxi/${id}`,
      images: post.images[0]?.url ? [{ url: post.images[0].url }] : [],
    },
  };
}

export default async function PostDetailPage({ params }: Props) {
  const { id } = await params;
  const postId = parseInt(id);
  if (isNaN(postId)) notFound();

  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      images: { orderBy: { sortOrder: 'asc' } },
      city: { select: { id: true, name: true } },
      category: { select: { id: true, name: true } },
      user: { select: { id: true, name: true, avatar: true, createdAt: true } },
    },
  });

  if (!post || post.status !== 'PUBLISHED') notFound();

  // Increment view count
  await prisma.post.update({ where: { id: post.id }, data: { viewCount: { increment: 1 } } });

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-500 mb-4">
        <Link href="/" className="hover:text-red-600">首页</Link>
        {' > '}
        <Link href="/xinxi/" className="hover:text-red-600">信息</Link>
        {' > '}
        <span className="text-gray-900">{post.title}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary">{POST_TYPE_LABELS[post.type] || post.type}</Badge>
                    {post.isPinned && <Badge variant="destructive">置顶</Badge>}
                  </div>
                  <CardTitle className="text-xl">{post.title}</CardTitle>
                </div>
                <div className="text-right shrink-0">
                  {post.priceMin ? (
                    <p className="text-2xl font-bold text-red-500">
                      ¥{post.priceMin}{post.priceMax && post.priceMax !== post.priceMin ? ` - ¥${post.priceMax}` : ''}
                    </p>
                  ) : null}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Images */}
              {post.images.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {post.images.map((img) => (
                    <div key={img.id} className="bg-gray-100 rounded-lg overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img.url}
                        alt={post.title}
                        className="w-full h-64 object-contain"
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Content */}
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{post.content}</p>
              </div>

              {/* Meta Info */}
              <Separator />
              <div className="flex items-center gap-6 text-sm text-gray-500">
                <span className="flex items-center gap-1"><Eye className="h-4 w-4" /> {post.viewCount + 1} 次浏览</span>
                <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {post.createdAt.toLocaleDateString('zh-CN')} 发布</span>
                <span>有效期至 {post.expiresAt.toLocaleDateString('zh-CN')}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">联系方式</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {post.contactName && (
                <p className="text-sm"><strong>联系人：</strong>{post.contactName}</p>
              )}
              {post.contactPhone && (
                <p className="text-sm flex items-center gap-1"><Phone className="h-4 w-4" /> {post.contactPhone}</p>
              )}
              {post.contactWechat && (
                <p className="text-sm"><strong>微信：</strong>{post.contactWechat}</p>
              )}
              {!post.contactPhone && !post.contactWechat && (
                <p className="text-sm text-gray-400">登录后查看联系方式</p>
              )}
            </CardContent>
          </Card>

          {/* Publisher Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">发布者</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-500">
                  {post.user.name?.charAt(0) || '用'}
                </div>
                <div>
                  <p className="font-medium">{post.user.name}</p>
                  <p className="text-xs text-gray-400">{post.user.createdAt.toLocaleDateString('zh-CN')} 加入</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">所在地区</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm flex items-center gap-1"><MapPin className="h-4 w-4" /> {post.city.name}</p>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardContent className="py-4 space-y-2">
              <Link href={`/pay/${post.id}`}>
                <Button className="w-full" variant="destructive" size="sm">
                  置顶推广
                </Button>
              </Link>
              <FavoriteButton postId={post.id} />
              <ReportButton postId={post.id} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Comments */}
      <Separator className="my-8" />
      <CommentSection targetType="post" targetId={post.id} />

      {/* Back Link */}
      <div className="mt-6 text-center">
        <Link href="/xinxi/" className="text-sm text-gray-500 hover:text-red-600">
          &larr; 返回信息列表
        </Link>
      </div>
    </div>
  );
}
