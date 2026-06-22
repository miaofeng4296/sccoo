'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function NewBannerPage() {
  const router = useRouter();
  const [form, setForm] = useState({ title: '', imageUrl: '', linkUrl: '', sortOrder: 0 });
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.imageUrl) { toast.error('请填写标题和图片URL'); return; }
    setLoading(true);
    try {
      await fetch('/api/admin/banners', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      toast.success('已创建');
      router.push('/admin/banners');
      router.refresh();
    } catch { toast.error('创建失败'); }
    setLoading(false);
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>新增 Banner</CardTitle>
            <Link href="/admin/banners" className="text-sm text-gray-500 hover:text-red-600">← 返回</Link>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <div><Label>标题 *</Label><Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} /></div>
            <div><Label>图片URL *</Label><Input value={form.imageUrl} onChange={e => setForm({...form, imageUrl: e.target.value})} placeholder="/banners/banner1.jpg" /></div>
            <div><Label>链接URL</Label><Input value={form.linkUrl} onChange={e => setForm({...form, linkUrl: e.target.value})} placeholder="/xinxi/" /></div>
            <div><Label>排序</Label><Input type="number" value={String(form.sortOrder)} onChange={e => setForm({...form, sortOrder: parseInt(e.target.value) || 0})} /></div>
            <Button type="submit" className="w-full" disabled={loading}>{loading ? '创建中...' : '创建'}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
