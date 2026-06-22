'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Props {
  postId: number;
  currentStatus: string;
}

export function PostActionsClient({ postId, currentStatus }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function updateStatus(status: string) {
    setLoading(status);
    try {
      const res = await fetch('/api/admin/posts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: postId, status }),
      });
      if (res.ok) {
        toast.success(status === 'PUBLISHED' ? '已通过审核' : status === 'REJECTED' ? '已拒绝' : '已删除');
        router.refresh();
      } else {
        const err = await res.json();
        toast.error(err.error || '操作失败');
      }
    } catch {
      toast.error('网络错误');
    }
    setLoading(null);
  }

  return (
    <div className="flex gap-1 flex-wrap">
      {currentStatus === 'PENDING' && (
        <>
          <Button
            size="sm"
            variant="outline"
            className="text-xs h-7 px-2 text-green-600 border-green-300 hover:bg-green-50"
            disabled={loading !== null}
            onClick={() => updateStatus('PUBLISHED')}
          >
            {loading === 'PUBLISHED' ? '...' : '通过'}
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-xs h-7 px-2 text-orange-600 border-orange-300 hover:bg-orange-50"
            disabled={loading !== null}
            onClick={() => updateStatus('REJECTED')}
          >
            {loading === 'REJECTED' ? '...' : '拒绝'}
          </Button>
        </>
      )}
      {currentStatus === 'REJECTED' && (
        <Button
          size="sm"
          variant="outline"
          className="text-xs h-7 px-2 text-green-600 border-green-300 hover:bg-green-50"
          disabled={loading !== null}
          onClick={() => updateStatus('PUBLISHED')}
        >
          {loading === 'PUBLISHED' ? '...' : '重新通过'}
        </Button>
      )}
      <Button
        size="sm"
        variant="outline"
        className="text-xs h-7 px-2 text-red-600 border-red-300 hover:bg-red-50"
        disabled={loading !== null}
        onClick={() => updateStatus('EXPIRED')}
      >
        {loading === 'EXPIRED' ? '...' : '删除'}
      </Button>
    </div>
  );
}
