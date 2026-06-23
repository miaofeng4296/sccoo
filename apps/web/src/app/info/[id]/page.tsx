import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@sccoo/db';
import { POST_TYPE_LABELS, PAGE_SIZE, PinType } from '@sccoo/shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

// Map legacy sccoo.cn info IDs to post types
const INFO_TYPE_MAP: Record<string, { types: string[]; label: string; description: string; categoryId?: number }> = {
  '122': { types: ['JOB', 'SEEK'], label: '招聘求职', description: '纹身师招聘、求职信息大全' },
  '153': { types: ['MODEL', 'BOOKING', 'SERVICE'], label: '我行我秀', description: '纹身作品展示、预约纹身、周边服务' },
  '4': { types: ['SHOP_TRANSFER'], label: '纹身店转让', description: '全国纹身店转让信息' },
  '1': { types: ['SECONDHAND'], label: '二手设备转让', description: '纹身设备、器材二手交易' },
  '149': { types: ['BOOKING'], label: '我要纹身', description: '预约纹身、找纹身师' },
  '20': { types: ['TRAINING'], label: '纹身培训', description: '纹身技术培训、学徒招生' },
  '28': { types: ['SERVICE'], label: '周边服务', description: '纹身周边服务信息' },
};

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

export default async function InfoSubPage({ params, searchParams }: Props) {
  const { id } = await params;
  const sp = await searchParams;
  const page = sp.page ? parseInt(sp.page) : 1;

  const mapping = INFO_TYPE_MAP[id];
  if (!mapping) notFound();

  const where = {
    status: 'PUBLISHED' as const,
    type: { in: mapping.types },
  };

  const [posts, total, cities] = await Promise.all([
    prisma.post.findMany({
      where,
      include: {
        images: { orderBy: { sortOrder: 'asc' }, take: 1 },
        city: { select: { id: true, name: true } },
        category: { select: { id: true, name: true } },
      },
      orderBy: [
        { isPinned: 'desc' },
        { pinExpiresAt: { sort: 'desc', nulls: 'last' } },
        { createdAt: 'desc' },
      ],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.post.count({ where }),
    prisma.city.findMany({ where: { parentId: { not: null }, isActive: true }, orderBy: { sortOrder: 'asc' } }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <div className="text-sm text-gray-500 mb-2">
          <Link href="/" className="hover:text-red-600">首页</Link>
          {' > '}
          <span className="text-gray-900">{mapping.label}</span>
        </div>
        <h1 className="text-2xl font-bold">{mapping.label}</h1>
        <p className="text-gray-500 mt-1">{mapping.description} · 共 {total} 条信息</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar - cities filter */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader><CardTitle className="text-base">地区筛选</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-col gap-1">
                <Link href={`/info/${id}/`}>
                  <span className="block text-sm py-1 hover:text-red-600 transition-colors font-medium text-red-600">全部地区</span>
                </Link>
                {cities.map(city => (
                  <Link key={city.id} href={`/xinxi/?cityId=${city.id}&type=${mapping.types[0]}`}>
                    <span className="block text-sm py-1 hover:text-red-600 transition-colors text-gray-600">{city.name}</span>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Category nav */}
          <Card className="mt-4">
            <CardHeader><CardTitle className="text-base">信息分类</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-1">
              {Object.entries(INFO_TYPE_MAP).map(([key, val]) => (
                <Link key={key} href={`/info/${key}/`}>
                  <span className={`block text-sm py-1.5 px-2 rounded transition-colors ${id === key ? 'bg-red-50 text-red-600 font-medium' : 'text-gray-600 hover:text-red-600'}`}>
                    {val.label}
                  </span>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Main list */}
        <div className="lg:col-span-3">
          {posts.length === 0 ? (
            <div className="text-center py-16 text-gray-400 bg-white rounded-lg">
              <p className="text-lg">暂无相关信息</p>
              <p className="mt-2">
                <Link href="/post/" className="text-red-600 hover:underline">发布一条{mapping.label}信息</Link>
              </p>
            </div>
          ) : (
            <>
              <Card>
                <CardContent className="divide-y p-0">
                  {posts.map(post => (
                    <Link key={post.id} href={`/xinxi/${post.id}`}>
                      <div className="flex items-start gap-4 p-4 hover:bg-gray-50 transition-colors">
                        {post.images[0] && (
                          <div className="w-24 h-20 bg-gray-100 rounded shrink-0 overflow-hidden">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={post.images[0].url} alt="" className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {post.isPinned && post.pinType && (
                              <Badge variant="destructive" className="text-xs">
                                {post.pinType === 'LARGE_TOP' ? '超大格' : post.pinType === 'MEDIUM_TOP' ? '大格' : '小格'}
                              </Badge>
                            )}
                            <Badge variant="secondary" className="text-xs">{POST_TYPE_LABELS[post.type] || post.type}</Badge>
                            <span className="text-xs text-gray-400">{post.city.name}</span>
                          </div>
                          <h3 className="font-medium line-clamp-1">{post.title}</h3>
                          <p className="text-sm text-gray-500 line-clamp-1 mt-0.5">{post.content}</p>
                          <p className="text-xs text-gray-400 mt-1">{post.createdAt.toLocaleDateString('zh-CN')}</p>
                        </div>
                        <div className="text-right shrink-0">
                          {post.priceMin && (
                            <p className="text-red-500 font-medium whitespace-nowrap">
                              ¥{post.priceMin}{post.priceMax && post.priceMax !== post.priceMin ? `-${post.priceMax}` : ''}
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </CardContent>
              </Card>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious href={page > 1 ? `/info/${id}/?page=${page - 1}` : '#'} className={page <= 1 ? 'pointer-events-none opacity-50' : ''} />
                      </PaginationItem>
                      {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => {
                        const p = i + 1;
                        return (
                          <PaginationItem key={p}>
                            <PaginationLink href={`/info/${id}/?page=${p}`} isActive={p === page}>{p}</PaginationLink>
                          </PaginationItem>
                        );
                      })}
                      <PaginationItem>
                        <PaginationNext href={page < totalPages ? `/info/${id}/?page=${page + 1}` : '#'} className={page >= totalPages ? 'pointer-events-none opacity-50' : ''} />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
