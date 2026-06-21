import Link from 'next/link';
import { prisma } from '@sccoo/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';

export const revalidate = 60;

export default async function NewsListPage() {
  const articles = await prisma.article.findMany({
    where: { isPublished: true },
    include: { category: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
  });

  const categories = await prisma.category.findMany({
    where: { articles: { some: {} } },
    distinct: ['id'],
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">新闻资讯</h1>

      {articles.length === 0 ? (
        <div className="text-center py-16 text-gray-400">暂无文章</div>
      ) : (
        <div className="space-y-4">
          {articles.map((article) => (
            <Link key={article.id} href={`/news/${article.id}`}>
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary" className="text-xs">{article.category.name}</Badge>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> {article.createdAt.toLocaleDateString('zh-CN')}
                      </span>
                    </div>
                    <h2 className="font-medium text-lg mb-1">{article.title}</h2>
                    {article.author && (
                      <p className="text-xs text-gray-500">{article.author}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
