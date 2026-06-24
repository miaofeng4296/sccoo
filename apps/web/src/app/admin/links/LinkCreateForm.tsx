'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function LinkCreateForm() {
  const router = useRouter();
  const [form, setForm] = useState({ title: '', url: '', sortOrder: '0' });
  const [submitting, setSubmitting] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.url) { toast.error('标题和URL不能为空'); return; }
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: form.title, url: form.url, sortOrder: parseInt(form.sortOrder) || 0 }),
      });
      if (res.ok) {
        toast.success('已添加');
        setForm({ title: '', url: '', sortOrder: '0' });
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({ error: '添加失败' }));
        toast.error(data.error || '添加失败');
      }
    } catch { toast.error('添加失败'); }
    finally { setSubmitting(false); }
  }

  return (
    <form onSubmit={submit} className="flex gap-3 items-end flex-wrap">
      <div>
        <label className="text-xs text-gray-500 block mb-1">标题</label>
        <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="网站名称" className="w-32 h-9" />
      </div>
      <div>
        <label className="text-xs text-gray-500 block mb-1">URL</label>
        <Input value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} placeholder="https://" className="w-52 h-9" />
      </div>
      <div>
        <label className="text-xs text-gray-500 block mb-1">排序</label>
        <Input type="number" value={form.sortOrder} onChange={e => setForm({ ...form, sortOrder: e.target.value })} className="w-20 h-9" />
      </div>
      <Button type="submit" size="sm" disabled={submitting}>{submitting ? '添加中...' : '添加'}</Button>
    </form>
  );
}
