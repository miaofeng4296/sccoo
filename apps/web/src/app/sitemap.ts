import type { MetadataRoute } from 'next';
import { prisma } from '@sccoo/db';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.sccoo.cn';

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'hourly', priority: 1 },
    { url: `${baseUrl}/xinxi/`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
    { url: `${baseUrl}/biz119/`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/biz123/`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/news/`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.7 },
    { url: `${baseUrl}/wenda/`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.7 },
    { url: `${baseUrl}/login/`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${baseUrl}/reg/`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
  ];

  // Dynamic: posts
  const posts = await prisma.post.findMany({
    where: { status: 'PUBLISHED' },
    select: { id: true, updatedAt: true },
  });
  const postUrls: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${baseUrl}/xinxi/${p.id}`,
    lastModified: p.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  // Dynamic: businesses
  const businesses = await prisma.business.findMany({
    where: { isVerified: true },
    select: { id: true, updatedAt: true },
  });
  const bizUrls: MetadataRoute.Sitemap = businesses.map((b) => ({
    url: `${baseUrl}/biz/${b.id}`,
    lastModified: b.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  // Dynamic: articles
  const articles = await prisma.article.findMany({
    where: { isPublished: true },
    select: { id: true, updatedAt: true },
  });
  const articleUrls: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${baseUrl}/news/${a.id}`,
    lastModified: a.updatedAt,
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }));

  return [...staticPages, ...postUrls, ...bizUrls, ...articleUrls];
}
