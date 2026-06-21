import Link from 'next/link';

const quickLinks = [
  { href: '/news/news_s6_t0_p1.html', label: '本站公告' },
  { href: '/news/news_s4_t0_p1.html', label: '纹身大师' },
  { href: '/news/news_s1_t0_p1.html', label: '纹身资讯' },
  { href: '/info28/', label: '纹身周边服务' },
  { href: '/about/join.html', label: '加入微信群' },
  { href: '#', label: '加入纹身两千人QQ群' },
];

export function SubNav() {
  return (
    <div className="bg-gray-100 border-b text-sm">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center gap-4 overflow-x-auto whitespace-nowrap">
        <strong className="text-gray-700 text-xs">快速导航：</strong>
        {quickLinks.map((link) => (
          <Link
            key={link.href + link.label}
            href={link.href}
            className="text-gray-600 hover:text-red-600 transition-colors text-xs"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
