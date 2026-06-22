'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, PlusCircle, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const hotSearches = ['纹身师招聘', '纹身培训', '店铺转让', '二手设备'];

export function Header() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    router.push(`/xinxi/?q=${encodeURIComponent(q)}`);
  }

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center gap-4 flex-wrap">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <span className="text-2xl font-bold text-red-600 tracking-wide">
              秀酷纹身之家
            </span>
          </Link>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 min-w-[200px] max-w-xl relative">
            <Input
              placeholder="搜索纹身信息、店铺、纹身师..."
              className="pr-16 h-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button type="submit" size="sm" className="absolute right-1 top-1/2 -translate-y-1/2">
              <Search className="h-4 w-4" />
            </Button>
          </form>

          {/* Hot searches */}
          <div className="hidden lg:flex items-center gap-2 text-sm text-gray-500">
            <strong className="text-gray-700">热门搜索：</strong>
            {hotSearches.map((term) => (
              <Link
                key={term}
                href={`/xinxi/?q=${encodeURIComponent(term)}`}
                className="hover:text-red-600 transition-colors"
              >
                {term}
              </Link>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 ml-auto">
            <Link href="/post/">
              <Button variant="destructive" size="sm" className="gap-1">
                <PlusCircle className="h-4 w-4" />
                发布信息
              </Button>
            </Link>
            <Link href="/login/?jump=/user/biz">
              <Button variant="outline" size="sm" className="gap-1">
                <Store className="h-4 w-4" />
                商家入驻
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
