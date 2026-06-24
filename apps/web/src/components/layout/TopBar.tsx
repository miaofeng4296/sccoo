'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { WeatherWidget } from '@/components/home/WeatherWidget';

export function TopBar() {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <div className="hidden md:flex items-center justify-between bg-gray-50 text-xs text-gray-600 px-4 py-1 border-b">
      <div className="flex items-center gap-2">
        <WeatherWidget />
      </div>
      <div className="flex items-center gap-1">
        {user ? (
          <>
            <Link href="/user/" className="hover:text-blue-600 px-1">
              {user.name || '个人中心'}
            </Link>
            <span className="mx-1 text-gray-300">|</span>
            <Link href="/post/" className="hover:text-blue-600 px-1">发布信息</Link>
            {user.role === 'ADMIN' && (
              <>
                <span className="mx-1 text-gray-300">|</span>
                <Link href="/admin/" className="hover:text-red-600 px-1 font-medium">管理后台</Link>
              </>
            )}
          </>
        ) : (
          <>
            <Link href="/reg/" className="hover:text-blue-600 px-1">注册</Link>
            <span>/</span>
            <Link href="/login/" className="hover:text-blue-600 px-1">登录</Link>
            <span className="mx-1 text-gray-300">|</span>
            <Link href="/qqlogin/" className="hover:text-blue-600 px-1">QQ登录</Link>
            <Link href="/wxLogin/" className="hover:text-blue-600 px-1">微信登录</Link>
          </>
        )}
      </div>
    </div>
  );
}
