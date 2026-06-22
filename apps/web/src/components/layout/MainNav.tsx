'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: '首页' },
  { href: '/info/122/', label: '招聘求职' },
  { href: '/info/153/', label: '我行我秀' },
  { href: '/info/4/', label: '纹身店转让' },
  { href: '/info/1/', label: '二手转让' },
  { href: '/wenda/', label: '纹身问答' },
  { href: '/info/149/', label: '我要纹身' },
  { href: '/info/20/', label: '纹身培训' },
  { href: '/biz119/', label: '纹身店大全' },
  { href: '/biz123/', label: '纹身师大全' },
];

export function MainNav() {
  const pathname = usePathname();

  return (
    <nav className="bg-red-600 text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4">
        <ul className="flex items-center overflow-x-auto whitespace-nowrap scrollbar-hide">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  'block px-4 py-3 text-sm hover:bg-red-700 transition-colors',
                  pathname === item.href && 'bg-red-700 font-bold'
                )}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
