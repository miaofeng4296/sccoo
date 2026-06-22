'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<'email' | 'sent'>('email');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) { toast.error('请输入邮箱'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/forgot-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
      if (res.ok) { setStep('sent'); } else {
        const err = await res.json();
        toast.error(err.error || '操作失败');
      }
    } catch { toast.error('网络错误'); }
    setLoading(false);
  }

  if (step === 'sent') {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-2">邮件已发送</h2>
        <p className="text-gray-500 mb-6">请查收密码重置邮件（本地开发环境请查看控制台日志）</p>
        <Link href="/login"><Button variant="outline">返回登录</Button></Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <Card>
        <CardHeader>
          <CardTitle>找回密码</CardTitle>
          <CardDescription>输入注册邮箱，我们将发送重置链接</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>注册邮箱</Label>
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>{loading ? '发送中...' : '发送重置链接'}</Button>
            <p className="text-center text-sm text-gray-500">
              <Link href="/login" className="text-red-600 hover:underline">返回登录</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
