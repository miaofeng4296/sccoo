'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Props {
  paymentId: number;
  postId: number;
  status: string;
  pinType: string;
  pinDays: number;
}

export function PaymentActionsClient({ paymentId, postId, status, pinType, pinDays }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function confirmPayment() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/payments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId, postId, pinType, pinDays, action: 'confirm' }),
      });
      if (res.ok) {
        toast.success('支付已确认，信息已置顶');
        router.refresh();
      } else {
        const err = await res.json();
        toast.error(err.error || '操作失败');
      }
    } catch {
      toast.error('网络错误');
    }
    setLoading(false);
  }

  async function cancelPayment() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/payments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId, postId, action: 'cancel' }),
      });
      if (res.ok) {
        toast.success('订单已取消');
        router.refresh();
      } else {
        const err = await res.json();
        toast.error(err.error || '操作失败');
      }
    } catch {
      toast.error('网络错误');
    }
    setLoading(false);
  }

  if (status !== 'PENDING') return null;

  return (
    <div className="flex gap-1">
      <Button
        size="sm"
        variant="outline"
        className="text-xs h-7 px-2 text-green-600 border-green-300 hover:bg-green-50"
        disabled={loading}
        onClick={confirmPayment}
      >
        {loading ? '...' : '确认支付'}
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="text-xs h-7 px-2 text-gray-500 border-gray-300 hover:bg-gray-50"
        disabled={loading}
        onClick={cancelPayment}
      >
        {loading ? '...' : '取消'}
      </Button>
    </div>
  );
}
