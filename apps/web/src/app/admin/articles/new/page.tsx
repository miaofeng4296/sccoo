import { auth } from '@/lib/auth';
import { prisma } from '@sccoo/db';
import { redirect } from 'next/navigation';
import { ArticleForm } from '../ArticleForm';

export const dynamic = 'force-dynamic';

export default async function NewArticlePage() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') redirect('/login/');

  const categories = await prisma.category.findMany({
    where: { articles: { some: {} } },
    distinct: ['id'],
  });

  return <ArticleForm categories={categories} />;
}
