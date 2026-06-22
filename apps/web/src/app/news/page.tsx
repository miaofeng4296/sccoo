import Link from 'next/link';
import { prisma } from '@sccoo/db';
import { PAGE_SIZE } from '@sccoo/shared';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';

export const revalidate = 60;

interface Props {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

export default async function NewsListPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = params.page ? parseInt(params.page) : 1;

  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where: { isPublished: true },
      include: { category: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.article.count({ where: { isPublished: true } }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">新闻资讯</h1>

      {articles.length === 0 ? (
        <div className="text-center py-16 text-gray-400">暂无文章</div>
      ) : (
        <>
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious href={page > 1 ? `/news/?page=${page - 1}` : '#'} className={page <= 1 ? 'pointer-events-none opacity-50' : ''} />
                  </PaginationItem>
                  {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => {
                    const p = i + 1;
                    return (
                      <PaginationItem key={p}>
                        <PaginationLink href={`/news/?page=${p}`} isActive={p === page}>{p}</PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  <PaginationItem>
                    <PaginationNext href={page < totalPages ? `/news/?page=${page + 1}` : '#'} className={page >= totalPages ? 'pointer-events-none opacity-50' : ''} />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      )}
    </div>
  );
}
