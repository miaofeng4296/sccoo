'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Props {
  linkId: number;
  isActive: boolean;
}

export function LinkActionsClient({ linkId, isActive }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggleActive() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/links', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: linkId, isActive: !isActive }),
      });
      if (res.ok) {
        toast.success(isActive ? '已禁用' : '已启用');
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({ error: '操作失败' }));
        toast.error(data.error || '操作失败');
      }
    } catch { toast.error('操作失败'); }
    finally { setLoading(false); }
  }

  async function deleteLink() {
    if (!confirm('确定要删除此友链吗？')) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin/links', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: linkId }),
      });
      if (res.ok) {
        toast.success('已删除');
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({ error: '操作失败' }));
        toast.error(data.error || '操作失败');
      }
    } catch { toast.error('操作失败'); }
    finally { setLoading(false); }
  }

  return (
    <div className="flex gap-1">
      <Button variant="outline" size="sm" onClick={toggleActive} disabled={loading}>
        {isActive ? '禁用' : '启用'}
      </Button>
      <Button variant="destructive" size="sm" onClick={deleteLink} disabled={loading}>
        删除
      </Button>
    </div>
  );
}
