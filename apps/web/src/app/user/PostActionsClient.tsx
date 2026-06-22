'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export function PostActionsClient({ postId }: { postId: number }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm('确定要删除这条信息吗？此操作不可恢复。')) return;
    setDeleting(true);
    try {
      const res = await fetch('/api/posts', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: postId }),
      });
      if (res.ok) {
        toast.success('信息已删除');
        router.refresh();
      } else {
        const err = await res.json();
        toast.error(err.error || '删除失败');
      }
    } catch {
      toast.error('网络错误');
    }
    setDeleting(false);
  }

  return (
    <div className="flex items-center gap-1 shrink-0">
      <Link href={`/post/edit/${postId}`}>
        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" title="编辑">
          <Pencil className="h-3.5 w-3.5" />
        </Button>
      </Link>
      <Button
        size="sm"
        variant="ghost"
        className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
        disabled={deleting}
        onClick={handleDelete}
        title="删除"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
