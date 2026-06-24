import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@sccoo/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, Eye, User } from 'lucide-react';
import { CommentSection } from '@/components/comments/CommentSection';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const article = await prisma.article.findUnique({
    where: { id: parseInt(id) },
    select: { title: true, content: true, coverImage: true },
  });
  if (!article) return { title: '文章不存在 - 秀酷纹身之家' };
  const baseUrl = process.env.NEXTAUTH_URL || 'https://www.sccoo.cn';
  return {
    title: `${article.title} - 秀酷纹身之家`,
    description: article.content.slice(0, 160),
    openGraph: {
      title: article.title,
      description: article.content.slice(0, 160),
      url: `${baseUrl}/news/${id}`,
      images: article.coverImage ? [{ url: article.coverImage }] : [],
    },
  };
}

export default async function ArticleDetailPage({ params }: Props) {
  const { id } = await params;
  const articleId = parseInt(id);
  if (isNaN(articleId)) notFound();

  const [article, related] = await Promise.all([
    prisma.article.findUnique({
      where: { id: articleId },
      include: { category: { select: { name: true } } },
    }),
    prisma.article.findMany({
      where: { isPublished: true, id: { not: articleId } },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ]);

  if (!article || !article.isPublished) notFound();

  // Increment view count
  await prisma.article.update({
    where: { id: article.id },
    data: { viewCount: { increment: 1 } },
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="text-sm text-gray-500 mb-4">
        <Link href="/" className="hover:text-red-600">首页</Link>
        {' > '}
        <Link href="/news/" className="hover:text-red-600">新闻资讯</Link>
        {' > '}
        <span>{article.title}</span>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="secondary">{article.category.name}</Badge>
          </div>
          <CardTitle className="text-2xl">{article.title}</CardTitle>
          <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
            {article.author && (
              <span className="flex items-center gap-1"><User className="h-4 w-4" /> {article.author}</span>
            )}
            <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> {article.createdAt.toLocaleDateString('zh-CN')}</span>
            <span className="flex items-center gap-1"><Eye className="h-4 w-4" /> {article.viewCount + 1}</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none">
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{article.content}</p>
          </div>
        </CardContent>
      </Card>

      {related.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">相关文章</CardTitle>
          </CardHeader>
          <CardContent className="divide-y">
            {related.map((a) => (
              <Link key={a.id} href={`/news/${a.id}`}>
                <div className="py-2 hover:text-red-600 transition-colors">
                  <p className="text-sm">{a.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{a.createdAt.toLocaleDateString('zh-CN')}</p>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Comments */}
      <Separator className="my-8" />
      <CommentSection targetType="article" targetId={article.id} />
    </div>
  );
}
