'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function AnswerForm({ questionId }: { questionId: number }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() || content.trim().length < 2) {
      toast.error('回答内容至少2个字符');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/answers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId, content: content.trim() }),
      });
      if (res.ok) {
        toast.success('回答已提交');
        setContent('');
        router.refresh();
      } else {
        const err = await res.json();
        toast.error(err.error || '提交失败');
      }
    } catch {
      toast.error('网络错误');
    }
    setLoading(false);
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-lg">写回答</CardTitle>
      </CardHeader>
      <CardContent>
        {!session ? (
          <div className="text-center py-4">
            <p className="text-sm text-gray-500 mb-3">登录后即可回答</p>
            <Link href={`/login/?jump=/wenda/${questionId}`}>
              <Button size="sm">去登录</Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <Textarea
              placeholder="写下您的回答..."
              rows={4}
              value={content}
              onChange={e => setContent(e.target.value)}
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={loading}>
                {loading ? '提交中...' : '提交回答'}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
