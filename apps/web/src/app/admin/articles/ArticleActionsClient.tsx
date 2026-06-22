'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function ArticleActionsClient({ articleId, isPublished }: { articleId: number; isPublished: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function togglePublish() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/articles', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: articleId, isPublished: !isPublished }),
      });
      if (res.ok) {
        toast.success(isPublished ? '已设为草稿' : '已发布');
        router.refresh();
      }
    } catch { toast.error('操作失败'); }
    setLoading(false);
  }

  async function handleDelete() {
    if (!confirm('确定要删除这篇文章吗？')) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin/articles', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: articleId }),
      });
      if (res.ok) {
        toast.success('文章已删除');
        router.refresh();
      }
    } catch { toast.error('删除失败'); }
    setLoading(false);
  }

  return (
    <div className="flex gap-1">
      <Link href={`/admin/articles/${articleId}/edit`}>
        <Button size="sm" variant="outline" className="text-xs h-7 px-2">编辑</Button>
      </Link>
      <Button size="sm" variant="outline" className="text-xs h-7 px-2" disabled={loading} onClick={togglePublish}>
        {isPublished ? '收回' : '发布'}
      </Button>
      <Button size="sm" variant="outline" className="text-xs h-7 px-2 text-red-600" disabled={loading} onClick={handleDelete}>
        删除
      </Button>
    </div>
  );
}
