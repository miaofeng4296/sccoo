'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export function ReportButton({ postId }: { postId: number }) {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  async function submitReport() {
    if (!session?.user) {
      toast.error('请先登录');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, reason }),
      });
      if (res.ok) {
        toast.success('举报已提交');
        setOpen(false);
        setReason('');
      } else {
        toast.error('提交失败');
      }
    } catch {
      toast.error('网络错误');
    }
    setLoading(false);
  }

  return (
    <>
      <Button
        className="w-full"
        variant="ghost"
        size="sm"
        onClick={() => setOpen(true)}
      >
        <AlertCircle className="h-4 w-4 mr-1" /> 举报信息
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>举报信息</DialogTitle>
            <DialogDescription>
              请说明举报原因，我们会尽快审核处理
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="请描述举报原因（虚假信息、侵权内容、违法信息等）..."
            value={reason}
            onChange={e => setReason(e.target.value)}
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>取消</Button>
            <Button onClick={submitReport} disabled={loading || !reason.trim()}>
              {loading ? '提交中...' : '提交举报'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
