import { auth } from '@/lib/auth';
import { prisma } from '@sccoo/db';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CityForm } from './CityForm';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminCitiesPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') redirect('/login/');

  const cities = await prisma.city.findMany({
    orderBy: { sortOrder: 'asc' },
    include: { parent: { select: { name: true } } },
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">城市管理</h1>
        <Link href="/admin" className="text-sm text-gray-500 hover:text-red-600">← 返回</Link>
      </div>
      <Card>
        <CardContent className="p-4">
          <CityForm />
          <div className="mt-4 space-y-2">
            {cities.map(c => (
              <div key={c.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                <span className="w-8 text-gray-400">{c.id}</span>
                <span className="flex-1">{c.name}</span>
                <span className="text-xs text-gray-400 mr-2">{c.slug} | {c.subdomain}</span>
                <span className="text-xs text-gray-400 mr-2">{c.parent?.name || '-'}</span>
                <Badge variant={c.isActive ? 'default' : 'secondary'} className="text-xs">{c.isActive ? '启用' : '禁用'}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
