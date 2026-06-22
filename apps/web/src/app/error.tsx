'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, RefreshCw, AlertTriangle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Page error:', error);
  }, [error]);

  return (
    <div className="max-w-lg mx-auto px-4 py-24 text-center">
      <AlertTriangle className="h-16 w-16 text-orange-400 mx-auto mb-4" />
      <h1 className="text-2xl font-bold mb-2">出错了</h1>
      <p className="text-gray-500 mb-2">
        页面加载时遇到了问题，请稍后重试。
      </p>
      {error.digest && (
        <p className="text-xs text-gray-400 mb-6 font-mono">
          Error ID: {error.digest}
        </p>
      )}
      <div className="flex items-center justify-center gap-4">
        <Button onClick={reset} variant="default">
          <RefreshCw className="h-4 w-4 mr-2" />
          重试
        </Button>
        <Link href="/">
          <Button variant="outline">
            <Home className="h-4 w-4 mr-2" />
            返回首页
          </Button>
        </Link>
      </div>
    </div>
  );
}
