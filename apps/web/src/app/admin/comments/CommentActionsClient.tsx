'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Props {
  commentId: number;
  isDeleted: boolean;
}

export function CommentActionsClient({ commentId, isDeleted }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggleDelete() {
    if (!confirm(isDeleted ? '确定要恢复这条评论吗？' : '确定要删除这条评论吗？')) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin/comments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: commentId, isDeleted: !isDeleted }),
      });
      if (res.ok) {
        toast.success(isDeleted ? '已恢复' : '已删除');
        router.refresh();
      } else {
        const data = await res.json();
        toast.error(data.error || '操作失败');
      }
    } catch {
      toast.error('操作失败');
    } finally {
      setLoading(false);
    }
  }

  async function hardDelete() {
    if (!confirm('确定要永久删除这条评论吗？此操作不可撤销！')) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin/comments', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: commentId }),
      });
      if (res.ok) {
        toast.success('已永久删除');
        router.refresh();
      } else {
        const data = await res.json();
        toast.error(data.error || '操作失败');
      }
    } catch {
      toast.error('操作失败');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex gap-1">
      <Button
        variant={isDeleted ? 'outline' : 'destructive'}
        size="sm"
        onClick={toggleDelete}
        disabled={loading}
      >
        {isDeleted ? '恢复' : '删除'}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={hardDelete}
        disabled={loading}
      >
        永久删除
      </Button>
    </div>
  );
}
