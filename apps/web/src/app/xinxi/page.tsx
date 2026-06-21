import Link from 'next/link';
import { prisma } from '@sccoo/db';
import { POST_TYPE_LABELS, PAGE_SIZE, PinType } from '@sccoo/shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';

export const revalidate = 60;

interface Props {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

export default async function PostListPage({ searchParams }: Props) {
  const params = await searchParams;
  const type = params.type;
  const categoryId = params.categoryId ? parseInt(params.categoryId) : undefined;
  const cityId = params.cityId ? parseInt(params.cityId) : undefined;
  const query = params.q;
  const view = params.view || 'list';
  const page = params.page ? parseInt(params.page) : 1;

  // Build where clause
  const where: Record<string, unknown> = { status: 'PUBLISHED' };
  if (type) where.type = type;
  if (categoryId) where.categoryId = categoryId;
  if (cityId) where.cityId = cityId;
  if (query) {
    where.OR = [
      { title: { contains: query } },
      { content: { contains: query } },
    ];
  }

  // Fetch data
  const [posts, total, cities, categories] = await Promise.all([
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
    prisma.category.findMany({ where: { parentId: null }, orderBy: { sortOrder: 'asc' } }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  function getPageUrl(p: number) {
    const searchParams = new URLSearchParams();
    if (type) searchParams.set('type', type);
    if (categoryId) searchParams.set('categoryId', String(categoryId));
    if (cityId) searchParams.set('cityId', String(cityId));
    if (query) searchParams.set('q', query);
    if (view !== 'list') searchParams.set('view', view);
    if (p > 1) searchParams.set('page', String(p));
    const qs = searchParams.toString();
    return `/xinxi/${qs ? '?' + qs : ''}`;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Filters Bar */}
      <Card className="mb-6">
        <CardContent className="py-4 space-y-3">
          {/* Category Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-gray-700 shrink-0">分类：</span>
            <Link href="/xinxi/">
              <Badge variant={!type ? 'secondary' : 'outline'} className="cursor-pointer">全部</Badge>
            </Link>
            {categories.map((cat) => (
              <Link key={cat.id} href={`/xinxi/?type=${cat.slug}`}>
                <Badge variant={type === cat.slug ? 'secondary' : 'outline'} className="cursor-pointer">
                  {cat.name}
                </Badge>
              </Link>
            ))}
          </div>

          {/* City Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-gray-700 shrink-0">地区：</span>
            <Link href="/xinxi/">
              <Badge variant={!cityId ? 'secondary' : 'outline'} className="cursor-pointer">全部</Badge>
            </Link>
            {cities.map((city) => (
              <Link key={city.id} href={`/xinxi/?cityId=${city.id}`}>
                <Badge variant={cityId === city.id ? 'secondary' : 'outline'} className="cursor-pointer">
                  {city.name}
                </Badge>
              </Link>
            ))}
          </div>

          {/* View Toggle */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">共 {total} 条信息</p>
            <div className="flex gap-2">
              <Link href={`/xinxi/?${new URLSearchParams({ ...Object.fromEntries(new URLSearchParams(params as Record<string,string>).entries()), view: 'list' }).toString()}`}>
                <Button variant={view !== 'grid' ? 'secondary' : 'outline'} size="sm">列表</Button>
              </Link>
              <Link href={`/xinxi/?${new URLSearchParams({ ...Object.fromEntries(new URLSearchParams(params as Record<string,string>).entries()), view: 'grid' }).toString()}`}>
                <Button variant={view === 'grid' ? 'secondary' : 'outline'} size="sm">网格</Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posts */}
      {posts.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg">暂无相关信息</p>
          <p className="mt-2">换个筛选条件试试，或<Link href="/post/" className="text-red-600 hover:underline">发布一条信息</Link></p>
        </div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {posts.map((post) => (
            <Link key={post.id} href={`/xinxi/${post.id}`}>
              <Card className="h-full hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  {post.images[0] && (
                    <div className="bg-gray-100 rounded h-40 mb-3 flex items-center justify-center text-gray-400 text-sm">
                      [图片]
                    </div>
                  )}
                  <div className="flex items-center gap-2 mb-2">
                    {post.isPinned && post.pinType && (
                      <Badge variant="destructive" className="text-xs">{post.pinType as string}</Badge>
                    )}
                    <Badge variant="secondary" className="text-xs">{post.city.name}</Badge>
                  </div>
                  <h3 className="font-medium line-clamp-2 mb-1">{post.title}</h3>
                  {post.priceMin && (
                    <p className="text-red-500 font-medium text-sm mt-2">
                      ¥{post.priceMin}{post.priceMax && post.priceMax !== post.priceMin ? `-${post.priceMax}` : ''}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">{post.createdAt.toLocaleDateString('zh-CN')}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="divide-y p-0">
            {posts.map((post) => (
              <Link key={post.id} href={`/xinxi/${post.id}`}>
                <div className="flex items-start gap-4 p-4 hover:bg-gray-50 transition-colors">
                  {post.images[0] && (
                    <div className="w-24 h-20 bg-gray-100 rounded shrink-0 flex items-center justify-center text-gray-400 text-xs">
                      [图片]
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {post.isPinned && post.pinType && (
                        <Badge variant="destructive" className="text-xs">{post.pinType === 'LARGE_TOP' ? '超大格' : post.pinType === 'MEDIUM_TOP' ? '大格' : '小格'}</Badge>
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
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href={getPageUrl(page - 1)} className={page <= 1 ? 'pointer-events-none opacity-50' : ''} />
              </PaginationItem>
              {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map((p) => (
                <PaginationItem key={p}>
                  <PaginationLink href={getPageUrl(p)} isActive={p === page}>{p}</PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext href={getPageUrl(page + 1)} className={page >= totalPages ? 'pointer-events-none opacity-50' : ''} />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
