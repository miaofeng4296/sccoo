'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function BannerActionsClient({ banner }: { banner: { id: number; isActive: boolean } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    try {
      await fetch('/api/admin/banners', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: banner.id, isActive: !banner.isActive }) });
      toast.success(banner.isActive ? '已禁用' : '已启用');
      router.refresh();
    } catch { toast.error('操作失败'); }
    setLoading(false);
  }

  async function del() {
    if (!confirm('确定删除？')) return;
    setLoading(true);
    try {
      await fetch('/api/admin/banners', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: banner.id }) });
      toast.success('已删除');
      router.refresh();
    } catch { toast.error('删除失败'); }
    setLoading(false);
  }

  return (
    <div className="flex gap-1">
      <Button size="sm" variant="outline" className="text-xs h-7 px-2" disabled={loading} onClick={toggle}>{banner.isActive ? '禁用' : '启用'}</Button>
      <Button size="sm" variant="outline" className="text-xs h-7 px-2 text-red-600" disabled={loading} onClick={del}>删除</Button>
    </div>
  );
}
