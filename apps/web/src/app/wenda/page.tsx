import Link from 'next/link';
import { prisma } from '@sccoo/db';
import { PAGE_SIZE } from '@sccoo/shared';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { CheckCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

interface Props {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

export default async function QAListPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = params.page ? parseInt(params.page) : 1;

  const [questions, total] = await Promise.all([
    prisma.qaQuestion.findMany({
      include: {
        user: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.qaQuestion.count(),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">纹身问答</h1>
          <p className="text-gray-500 mt-1">纹身相关问题交流和解答 · 共 {total} 个问题</p>
        </div>
        <Link href="/wenda/ask"><Button size="sm">我要提问</Button></Link>
      </div>

      {questions.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg">暂无问题</p>
          <p className="mt-2">成为第一个提问的人吧！</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {questions.map((q) => (
              <Link key={q.id} href={`/wenda/${q.id}`}>
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="text-center shrink-0 w-16">
                        <div className="text-lg font-bold text-gray-700">{q.answerCount}</div>
                        <div className="text-xs text-gray-400">回答</div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h2 className="font-medium line-clamp-2 flex items-center gap-2">
                          {q.title}
                          {q.isResolved && <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />}
                        </h2>
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                          <span>{q.user.name}</span>
                          <span>{q.createdAt.toLocaleDateString('zh-CN')}</span>
                          <span className="flex items-center gap-1">
                            <EyeIcon /> {q.viewCount}
                          </span>
                        </div>
                      </div>
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
                    <PaginationPrevious href={page > 1 ? `/wenda/?page=${page - 1}` : '#'} className={page <= 1 ? 'pointer-events-none opacity-50' : ''} />
                  </PaginationItem>
                  {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => {
                    const p = i + 1;
                    return (
                      <PaginationItem key={p}>
                        <PaginationLink href={`/wenda/?page=${p}`} isActive={p === page}>{p}</PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  <PaginationItem>
                    <PaginationNext href={page < totalPages ? `/wenda/?page=${page + 1}` : '#'} className={page >= totalPages ? 'pointer-events-none opacity-50' : ''} />
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

function EyeIcon() {
  return (
    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}
