import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="max-w-lg mx-auto px-4 py-24 text-center">
      <h1 className="text-8xl font-bold text-red-200 mb-4">404</h1>
      <h2 className="text-2xl font-bold mb-2">页面未找到</h2>
      <p className="text-gray-500 mb-8">
        您访问的页面不存在或已被删除。请检查网址是否正确，或返回首页。
      </p>
      <div className="flex items-center justify-center gap-4">
        <Link href="/">
          <Button variant="default">
            <Home className="h-4 w-4 mr-2" />
            返回首页
          </Button>
        </Link>
        <Link href="/xinxi/">
          <Button variant="outline">
            <Search className="h-4 w-4 mr-2" />
            浏览信息
          </Button>
        </Link>
      </div>
    </div>
  );
}
