'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function ExpirePostsButton({ count }: { count: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function expire() {
    if (!confirm(`确定要将 ${count} 条过期信息标为已过期吗？`)) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin/expire-posts', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        toast.success(data.message);
        router.refresh();
      } else toast.error('操作失败');
    } catch { toast.error('网络错误'); }
    setLoading(false);
  }

  return <Button size="sm" variant="destructive" disabled={loading || count === 0} onClick={expire}>{loading ? '处理中...' : '清理过期'}</Button>;
}
