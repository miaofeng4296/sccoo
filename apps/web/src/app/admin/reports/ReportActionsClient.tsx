'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface Props {
  reportId: number;
  postId: number;
  currentStatus: string;
}

export function ReportActionsClient({ reportId, postId, currentStatus }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function handleAction(action: string) {
    let msg = '';
    if (action === 'DISMISSED') msg = '确定要忽略此举报吗？';
    else if (action === 'RESOLVED') msg = '确定要删除被举报的信息并标记为已处理吗？';
    else if (action === 'DELETE_POST') msg = '确定要删除被举报的信息吗？此操作不可撤销！';
    if (msg && !confirm(msg)) return;

    setLoading(action);
    try {
      if (action === 'DELETE_POST') {
        // Soft delete the post
        const postRes = await fetch('/api/admin/posts', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: postId, status: 'EXPIRED' }),
        });
        if (!postRes.ok) {
          const err = await postRes.json().catch(() => ({ error: '操作失败' }));
          toast.error(err.error || '删除信息失败');
          setLoading(null);
          return;
        }
      }

      // Update report status
      const res = await fetch('/api/admin/reports', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: reportId,
          status: action === 'DELETE_POST' ? 'RESOLVED' : action,
        }),
      });

      if (res.ok) {
        toast.success(action === 'DISMISSED' ? '已忽略' : '已处理');
        router.refresh();
      } else {
        const data = await res.json();
        toast.error(data.error || '操作失败');
      }
    } catch {
      toast.error('操作失败');
    } finally {
      setLoading(null);
    }
  }

  if (currentStatus !== 'PENDING') {
    return (
      <Badge variant={currentStatus === 'RESOLVED' ? 'default' : 'secondary'} className="text-xs">
        {currentStatus === 'RESOLVED' ? '已处理' : '已忽略'}
      </Badge>
    );
  }

  return (
    <div className="flex gap-1">
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleAction('DISMISSED')}
        disabled={loading !== null}
      >
        {loading === 'DISMISSED' ? '...' : '忽略'}
      </Button>
      <Button
        variant="destructive"
        size="sm"
        onClick={() => handleAction('DELETE_POST')}
        disabled={loading !== null}
      >
        {loading === 'DELETE_POST' ? '...' : '删除信息'}
      </Button>
    </div>
  );
}
