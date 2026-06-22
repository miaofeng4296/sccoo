'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface Category { id: number; name: string; }
interface InitialData { id?: number; title?: string; content?: string; categoryId?: number; author?: string | null; coverImage?: string | null; isPublished?: boolean; }

interface Props {
  categories: Category[];
  initialData?: InitialData;
}

export function ArticleForm({ categories, initialData }: Props) {
  const router = useRouter();
  const isEdit = !!initialData?.id;
  const [form, setForm] = useState({
    title: initialData?.title || '',
    content: initialData?.content || '',
    categoryId: initialData?.categoryId || (categories[0]?.id || 0),
    author: initialData?.author || '',
    coverImage: initialData?.coverImage || '',
    isPublished: initialData?.isPublished ?? true,
  });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.content) { toast.error('请填写标题和内容'); return; }

    setLoading(true);
    const url = '/api/admin/articles';
    const method = isEdit ? 'PATCH' : 'POST';
    const body: Record<string, unknown> = { ...form };
    if (isEdit) body.id = initialData!.id;

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        toast.success(isEdit ? '文章已更新' : '文章已创建');
        router.push('/admin/articles');
        router.refresh();
      } else {
        const err = await res.json();
        toast.error(err.error || '操作失败');
      }
    } catch { toast.error('网络错误'); }
    setLoading(false);
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{isEdit ? '编辑文章' : '新增文章'}</CardTitle>
            <Link href="/admin/articles" className="text-sm text-gray-500 hover:text-red-600">← 返回</Link>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>标题 *</Label>
              <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} maxLength={200} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>分类 *</Label>
                <Select value={String(form.categoryId)} onValueChange={v => setForm({ ...form, categoryId: parseInt(v ?? '0') })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {categories.map(c => (
                      <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>作者</Label>
                <Input value={form.author} onChange={e => setForm({ ...form, author: e.target.value })} placeholder="管理员" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>封面图 URL</Label>
              <Input value={form.coverImage} onChange={e => setForm({ ...form, coverImage: e.target.value })} placeholder="https://..." />
            </div>
            <div className="space-y-2">
              <Label>内容 *</Label>
              <Textarea rows={12} value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} placeholder="支持 Markdown..." />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="published" checked={form.isPublished} onChange={e => setForm({ ...form, isPublished: e.target.checked })} />
              <Label htmlFor="published" className="cursor-pointer">立即发布</Label>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? '保存中...' : isEdit ? '保存修改' : '创建文章'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
