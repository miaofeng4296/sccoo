'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function ChangePasswordPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);

  if (!session?.user) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <p className="text-gray-500 mb-4">请先登录</p>
        <Link href="/login/?jump=/user/password"><Button>去登录</Button></Link>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (form.newPassword.length < 6) {
      toast.error('新密码至少6个字符');
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      toast.error('两次密码输入不一致');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/user/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        }),
      });
      if (res.ok) {
        toast.success('密码修改成功，请重新登录');
        router.push('/login');
      } else {
        const err = await res.json();
        toast.error(err.error || '修改失败');
      }
    } catch {
      toast.error('网络错误');
    }
    setLoading(false);
  }

  return (
    <div className="max-w-md mx-auto px-4 py-6">
      <Card>
        <CardHeader>
          <CardTitle>修改密码</CardTitle>
          <CardDescription>修改您的登录密码</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>当前密码</Label>
              <Input type="password" value={form.currentPassword} onChange={e => setForm({ ...form, currentPassword: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>新密码</Label>
              <Input type="password" value={form.newPassword} onChange={e => setForm({ ...form, newPassword: e.target.value })} placeholder="至少6个字符" />
            </div>
            <div className="space-y-2">
              <Label>确认新密码</Label>
              <Input type="password" value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? '修改中...' : '修改密码'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
