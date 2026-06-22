'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const jumpUrl = searchParams.get('jump') || '/';
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const result = await signIn('credentials', {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      toast.error('邮箱/手机号或密码错误');
    } else {
      toast.success('登录成功');
      router.push(jumpUrl);
      router.refresh();
    }
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">登录</CardTitle>
          <CardDescription>登录秀酷纹身之家，发布和管理信息</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">邮箱 / 手机号</Label>
              <Input
                id="email"
                type="text"
                placeholder="请输入邮箱或手机号"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">密码</Label>
              <Input
                id="password"
                type="password"
                placeholder="请输入密码"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? '登录中...' : '登录'}
            </Button>
          </form>

          <Separator className="my-4" />

          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" disabled className="gap-2">
              <span className="text-blue-500 font-bold">Q</span> QQ登录
            </Button>
            <Button variant="outline" disabled className="gap-2">
              <span className="text-green-500 font-bold">微</span> 微信登录
            </Button>
          </div>
          <p className="text-xs text-gray-500 text-center mt-3">
            QQ/微信登录即将开放
          </p>
        </CardContent>
        <CardFooter className="flex-col gap-2 justify-center">
          <p className="text-sm text-gray-600">
            还没有账号？{' '}
            <Link href="/reg/" className="text-red-600 hover:underline font-medium">
              立即注册
            </Link>
          </p>
          <p className="text-sm text-gray-500">
            <Link href="/forgot-password" className="hover:text-red-600 transition-colors">
              忘记密码？
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
