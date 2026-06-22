'use client';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
// Next.js 16: useSearchParams from next/navigation
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

function ResetForm() {
  const router = useRouter();
  // Simple approach: just use email from URL or manual entry
  const [form, setForm] = useState({ email: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.newPassword.length < 6) { toast.error('密码至少6个字符'); return; }
    if (form.newPassword !== form.confirmPassword) { toast.error('两次密码不一致'); return; }

    setLoading(true);
    try {
      const res = await fetch('/api/user/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, newPassword: form.newPassword }),
      });
      if (res.ok) {
        toast.success('密码已重置，请登录');
        router.push('/login');
      } else {
        const err = await res.json();
        toast.error(err.error || '重置失败');
      }
    } catch { toast.error('网络错误'); }
    setLoading(false);
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <Card>
        <CardHeader>
          <CardTitle>重置密码</CardTitle>
          <CardDescription>输入邮箱和新密码</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>注册邮箱</Label>
              <Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>新密码</Label>
              <Input type="password" value={form.newPassword} onChange={e => setForm({ ...form, newPassword: e.target.value })} placeholder="至少6个字符" />
            </div>
            <div className="space-y-2">
              <Label>确认密码</Label>
              <Input type="password" value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>{loading ? '重置中...' : '重置密码'}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="max-w-md mx-auto px-4 py-16 text-center">加载中...</div>}>
      <ResetForm />
    </Suspense>
  );
}
