'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function VerifyButton({ bizId, isVerified }: { bizId: number; isVerified: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/businesses', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: bizId, isVerified: !isVerified }),
      });
      if (res.ok) { toast.success(isVerified ? '已取消认证' : '已认证'); router.refresh(); }
      else { const err = await res.json(); toast.error(err.error || '操作失败'); }
    } catch { toast.error('网络错误'); }
    setLoading(false);
  }

  return <Button size="sm" variant="outline" className="text-xs h-7 px-2" disabled={loading} onClick={toggle}>{isVerified ? '取消认证' : '认证通过'}</Button>;
}
