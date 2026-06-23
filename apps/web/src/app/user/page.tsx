import { auth, signOut } from '@/lib/auth';
import { prisma } from '@sccoo/db';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { POST_TYPE_LABELS } from '@sccoo/shared';
import { redirect } from 'next/navigation';
import { PostActionsClient } from './PostActionsClient';

export const dynamic = 'force-dynamic';

export default async function UserCenterPage() {
  const session = await auth();
  if (!session?.user) redirect('/login/?jump=/user/');

  const [myPosts, myFavorites] = await Promise.all([
    prisma.post.findMany({
      where: { userId: session.user.id },
      include: { city: { select: { name: true } }, category: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
    prisma.favorite.findMany({
      where: { userId: session.user.id },
      include: {
        post: {
          include: { city: { select: { name: true } }, category: { select: { name: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
  ]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Profile Header */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-2xl font-bold text-red-600">
                {session.user.name?.charAt(0) || '用'}
              </div>
              <div>
                <h1 className="text-xl font-bold">{session.user.name}</h1>
                <p className="text-sm text-gray-500">{session.user.email}</p>
                <Badge variant="secondary" className="mt-1">{session.user.role === 'ADMIN' ? '管理员' : '普通用户'}</Badge>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href="/post/"><Button size="sm" variant="destructive">发布信息</Button></Link>
              <form action={async () => { 'use server'; await signOut({ redirectTo: '/' }); }}>
                <Button size="sm" variant="outline" type="submit">退出登录</Button>
              </form>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* My Posts */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">我的发布</CardTitle>
              <Badge>{myPosts.length}</Badge>
            </div>
          </CardHeader>
          <CardContent className="divide-y">
            {myPosts.length === 0 ? (
              <p className="text-gray-400 text-sm py-4 text-center">暂无发布信息</p>
            ) : (
              myPosts.map((post) => (
                <div key={post.id} className="py-3 hover:bg-gray-50 -mx-2 px-2 rounded transition-colors">
                  <div className="flex items-center justify-between gap-2">
                    <Link href={`/xinxi/${post.id}`} className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {POST_TYPE_LABELS[post.type] || post.type}
                        </Badge>
                        <Badge variant={post.status === 'PUBLISHED' ? 'default' : 'outline'} className="text-xs">
                          {post.status === 'PUBLISHED' ? '已发布' : post.status === 'PENDING' ? '审核中' : post.status}
                        </Badge>
                      </div>
                      <p className="text-sm font-medium mt-1 line-clamp-1">{post.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{post.createdAt.toLocaleDateString('zh-CN')} · {post.city.name}</p>
                    </Link>
                    <PostActionsClient postId={post.id} />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* My Favorites */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">我的收藏</CardTitle>
              <Badge>{myFavorites.length}</Badge>
            </div>
          </CardHeader>
          <CardContent className="divide-y">
            {myFavorites.length === 0 ? (
              <p className="text-gray-400 text-sm py-4 text-center">暂无收藏</p>
            ) : (
              myFavorites.map((fav) => (
                <Link key={fav.id} href={`/xinxi/${fav.post.id}`}>
                  <div className="py-3 hover:bg-gray-50 -mx-2 px-2 rounded transition-colors">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {POST_TYPE_LABELS[fav.post.type] || fav.post.type}
                      </Badge>
                    </div>
                    <p className="text-sm font-medium mt-1 line-clamp-1">{fav.post.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{fav.post.city.name} · ¥{fav.post.priceMin || '面议'}</p>
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
