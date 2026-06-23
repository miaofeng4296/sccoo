import { auth } from '@/lib/auth';
import { prisma } from '@sccoo/db';
import { notFound, redirect } from 'next/navigation';
import { ArticleForm } from '../../ArticleForm';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditArticlePage({ params }: Props) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') redirect('/login/');

  const { id } = await params;
  const articleId = parseInt(id);
  if (isNaN(articleId)) notFound();

  const [article, categories] = await Promise.all([
    prisma.article.findUnique({ where: { id: articleId } }),
    prisma.category.findMany({ where: { articles: { some: {} } }, distinct: ['id'] }),
  ]);

  if (!article) notFound();

  return <ArticleForm categories={categories} initialData={article} />;
}
