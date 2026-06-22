'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function EditPostPage() {
  const { id } = useParams<{ id: string }>();
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [form, setForm] = useState({
    title: '',
    content: '',
    priceMin: '',
    priceMax: '',
    contactName: '',
    contactPhone: '',
    contactWechat: '',
  });

  useEffect(() => {
    // Fetch existing post data via the xinxi page
    fetch(`/api/posts?id=${id}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) { toast.error('信息不存在'); router.push('/user'); return; }
        setForm({
          title: data.title || '',
          content: data.content || '',
          priceMin: data.priceMin?.toString() || '',
          priceMax: data.priceMax?.toString() || '',
          contactName: data.contactName || '',
          contactPhone: data.contactPhone || '',
          contactWechat: data.contactWechat || '',
        });
        setFetching(false);
      })
      .catch(() => { toast.error('加载失败'); router.push('/user'); });
  }, [id, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!session?.user) { toast.error('请先登录'); return; }
    if (!form.title || !form.content) { toast.error('标题和内容不能为空'); return; }

    setLoading(true);
    try {
      const res = await fetch(`/api/posts`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: parseInt(id!),
          ...form,
          priceMin: form.priceMin ? parseInt(form.priceMin) : undefined,
          priceMax: form.priceMax ? parseInt(form.priceMax) : undefined,
          contactName: form.contactName || undefined,
          contactPhone: form.contactPhone || undefined,
          contactWechat: form.contactWechat || undefined,
        }),
      });
      if (res.ok) {
        toast.success('信息已更新');
        router.push(`/xinxi/${id}`);
        router.refresh();
      } else {
        const err = await res.json();
        toast.error(err.error || '更新失败');
      }
    } catch {
      toast.error('网络错误');
    }
    setLoading(false);
  }

  if (fetching) {
    return <div className="max-w-2xl mx-auto px-4 py-16 text-center text-gray-400">加载中...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <Card>
        <CardHeader>
          <CardTitle>编辑信息</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>标题 *</Label>
              <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} maxLength={200} />
            </div>
            <div className="space-y-2">
              <Label>详细内容 *</Label>
              <Textarea rows={6} value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} maxLength={5000} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>最低薪资/价格</Label>
                <Input type="number" value={form.priceMin} onChange={e => setForm({ ...form, priceMin: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>最高薪资/价格</Label>
                <Input type="number" value={form.priceMax} onChange={e => setForm({ ...form, priceMax: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>联系人</Label>
                <Input value={form.contactName} onChange={e => setForm({ ...form, contactName: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>联系电话</Label>
                <Input value={form.contactPhone} onChange={e => setForm({ ...form, contactPhone: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>微信</Label>
                <Input value={form.contactWechat} onChange={e => setForm({ ...form, contactWechat: e.target.value })} />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? '保存中...' : '保存修改'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
