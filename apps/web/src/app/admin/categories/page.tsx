import { auth } from '@/lib/auth';
import { prisma } from '@sccoo/db';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CategoryForm } from './CategoryForm';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminCategoriesPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') redirect('/login/');

  const categories = await prisma.category.findMany({ orderBy: { sortOrder: 'asc' } });

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">分类管理</h1>
        <Link href="/admin" className="text-sm text-gray-500 hover:text-red-600">← 返回</Link>
      </div>
      <Card>
        <CardContent className="p-4">
          <CategoryForm />
          <div className="mt-4 space-y-2">
            {categories.map(c => (
              <div key={c.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                <span className="w-8 text-gray-400">{c.id}</span>
                <span className="flex-1">{c.name}</span>
                <span className="text-xs text-gray-400 mr-2">{c.slug}</span>
                <span className="text-xs text-gray-400 w-8">#{c.sortOrder}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
