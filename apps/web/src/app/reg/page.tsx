'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: '',
    phone: '',
    name: '',
    password: '',
    confirmPassword: '',
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      toast.error('两次密码输入不一致');
      return;
    }

    if (form.password.length < 6) {
      toast.error('密码至少6位');
      return;
    }

    if (!form.email && !form.phone) {
      toast.error('请填写邮箱或手机号');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email || null,
          phone: form.phone || null,
          name: form.name || '用户',
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || '注册失败');
        setLoading(false);
        return;
      }

      toast.success('注册成功，正在登录...');

      // Auto sign in after registration
      const result = await signIn('credentials', {
        email: form.email || form.phone,
        password: form.password,
        redirect: false,
      });

      if (result?.ok) {
        router.push('/');
        router.refresh();
      }
    } catch {
      toast.error('网络错误，请重试');
    }

    setLoading(false);
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">注册</CardTitle>
          <CardDescription>创建账号，畅享纹身行业信息平台</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">邮箱</Label>
              <Input
                id="email"
                type="email"
                placeholder="请输入邮箱（与手机号二选一）"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">手机号</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="请输入手机号（与邮箱二选一）"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">昵称</Label>
              <Input
                id="name"
                type="text"
                placeholder="给自己取个名字吧"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">密码</Label>
              <Input
                id="password"
                type="password"
                placeholder="至少6位"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">确认密码</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="再次输入密码"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? '注册中...' : '注册'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-gray-600">
            已有账号？{' '}
            <Link href="/login/" className="text-red-600 hover:underline font-medium">
              立即登录
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
