'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function AskQuestionPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!session?.user) {
      toast.error('请先登录');
      router.push('/login/?jump=/wenda/ask');
      return;
    }

    if (title.trim().length < 3) {
      toast.error('标题至少3个字符');
      return;
    }
    if (content.trim().length < 10) {
      toast.error('内容至少10个字符');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), content: content.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        toast.success('提问成功！');
        router.push(`/wenda/${data.id}`);
        router.refresh();
      } else {
        const err = await res.json();
        toast.error(err.error || '提问失败');
      }
    } catch {
      toast.error('网络错误');
    }
    setLoading(false);
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <Card>
        <CardHeader>
          <CardTitle>我要提问</CardTitle>
          <CardDescription>描述您的问题，大家会帮你解答</CardDescription>
        </CardHeader>
        <CardContent>
          {!session ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">请先登录后再提问</p>
              <Link href="/login/?jump=/wenda/ask">
                <Button>去登录</Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>问题标题 *</Label>
                <Input
                  placeholder="简明扼要地描述你的问题"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  maxLength={200}
                />
              </div>
              <div className="space-y-2">
                <Label>问题详情 *</Label>
                <Textarea
                  placeholder="详细描述问题的背景、具体情况等..."
                  rows={6}
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  maxLength={5000}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? '提交中...' : '发布问题'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
