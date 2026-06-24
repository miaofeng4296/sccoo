import { prisma } from '@sccoo/db';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

export async function GET() {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://www.sccoo.cn';

  // Escape CDATA terminator sequence
  function escCDATA(text: string): string {
    return text.replace(/]]>/g, ']]]]><![CDATA[>');
  }

  const [posts, articles] = await Promise.all([
    prisma.post.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { createdAt: 'desc' },
      take: 30,
      select: { id: true, title: true, content: true, createdAt: true },
    }),
    prisma.article.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: 'desc' },
      take: 30,
      select: { id: true, title: true, content: true, createdAt: true },
    }),
  ]);

  const items = [
    ...posts.map((p) => ({
      title: escCDATA(p.title),
      link: `${baseUrl}/xinxi/${p.id}`,
      description: escCDATA(p.content.slice(0, 300)),
      pubDate: new Date(p.createdAt).toUTCString(),
      guid: `${baseUrl}/xinxi/${p.id}`,
    })),
    ...articles.map((a) => ({
      title: escCDATA(a.title),
      link: `${baseUrl}/news/${a.id}`,
      description: escCDATA(a.content.slice(0, 300)),
      pubDate: new Date(a.createdAt).toUTCString(),
      guid: `${baseUrl}/news/${a.id}`,
    })),
  ]
    .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
    .slice(0, 50);

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>秀酷纹身之家</title>
    <link>${baseUrl}</link>
    <description>纹身行业信息平台 - 提供纹身师招聘求职、纹身店转让、二手设备交易、纹身培训等信息服务</description>
    <language>zh-CN</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/rss" rel="self" type="application/rss+xml"/>
${items
  .map(
    (item) => `    <item>
      <title><![CDATA[${item.title}]]></title>
      <link>${item.link}</link>
      <description><![CDATA[${item.description}]]></description>
      <pubDate>${item.pubDate}</pubDate>
      <guid>${item.guid}</guid>
    </item>`
  )
  .join('\n')}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
