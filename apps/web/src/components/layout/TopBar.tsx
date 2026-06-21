'use client';

import Link from 'next/link';

export function TopBar() {
  return (
    <div className="hidden md:flex items-center justify-between bg-gray-50 text-xs text-gray-600 px-4 py-1 border-b">
      <div className="flex items-center gap-2">
        {/* Weather iframe placeholder — replace with real weather API */}
        <span className="text-gray-400">天气数据加载中...</span>
      </div>
      <div className="flex items-center gap-1">
        <Link href="/reg/" className="hover:text-blue-600 px-1">注册</Link>
        <span>/</span>
        <Link href="/login/" className="hover:text-blue-600 px-1">登录</Link>
        <span className="mx-1 text-gray-300">|</span>
        <Link href="/qqlogin/" className="hover:text-blue-600 px-1">QQ登录</Link>
        <Link href="/wxLogin/" className="hover:text-blue-600 px-1">微信登录</Link>
      </div>
    </div>
  );
}
