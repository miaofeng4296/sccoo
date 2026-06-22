'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function CityForm() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', slug: '', subdomain: '', sortOrder: 0 });
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name) { toast.error('请输入名称'); return; }
    setLoading(true);
    try {
      await fetch('/api/admin/cities', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, slug: form.slug || form.name, subdomain: form.subdomain || form.name }) });
      toast.success('已添加');
      setForm({ name: '', slug: '', subdomain: '', sortOrder: 0 });
      router.refresh();
    } catch { toast.error('添加失败'); }
    setLoading(false);
  }

  return (
    <form onSubmit={submit} className="flex gap-2 flex-wrap">
      <Input placeholder="城市名" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-24" />
      <Input placeholder="子域名" value={form.subdomain} onChange={e => setForm({...form, subdomain: e.target.value})} className="w-28" />
      <Input placeholder="slug" value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} className="w-28" />
      <Input type="number" placeholder="排序" value={String(form.sortOrder)} onChange={e => setForm({...form, sortOrder: parseInt(e.target.value) || 0})} className="w-16" />
      <Button type="submit" size="sm" disabled={loading}>{loading ? '...' : '添加'}</Button>
    </form>
  );
}
