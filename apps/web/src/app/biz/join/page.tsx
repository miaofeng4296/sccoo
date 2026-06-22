'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export default function BusinessJoinPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [cities, setCities] = useState<{ id: number; name: string }[]>([]);
  const [form, setForm] = useState({ name: '', phone: '', address: '', cityId: 0, description: '', website: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetch('/api/cities').then(r => r.json()).then(setCities).catch(() => {}); }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!session?.user) { toast.error('请先登录'); router.push('/login/?jump=/biz/join'); return; }
    if (!form.name || !form.cityId) { toast.error('请填写店名和地区'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/businesses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, cityId: form.cityId }),
      });
      if (res.ok) {
        toast.success('入驻申请已提交，请等待审核');
        router.push('/user');
      } else {
        const err = await res.json();
        toast.error(err.error || '提交失败');
      }
    } catch { toast.error('网络错误'); }
    setLoading(false);
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <Card>
        <CardHeader>
          <CardTitle>商家入驻</CardTitle>
          <CardDescription>提交您的纹身店信息，审核通过后展示在商家黄页中</CardDescription>
        </CardHeader>
        <CardContent>
          {!session ? (
            <div className="text-center py-8"><p className="text-gray-500 mb-4">请先登录</p><Link href="/login/?jump=/biz/join"><Button>去登录</Button></Link></div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-2"><Label>店铺名称 *</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} maxLength={100} /></div>
              <div className="space-y-2"><Label>联系电话</Label><Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
              <div className="space-y-2"><Label>所在地区 *</Label>
                <Select value={form.cityId ? String(form.cityId) : ''} onValueChange={v => setForm({...form, cityId: parseInt(v ?? '0')})}>
                  <SelectTrigger><SelectValue placeholder="选择城市" /></SelectTrigger>
                  <SelectContent>{cities.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>详细地址</Label><Input value={form.address} onChange={e => setForm({...form, address: e.target.value})} /></div>
              <div className="space-y-2"><Label>网站</Label><Input value={form.website} onChange={e => setForm({...form, website: e.target.value})} placeholder="https://" /></div>
              <div className="space-y-2"><Label>店铺介绍</Label><Textarea rows={4} value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="介绍你的纹身店特色..." /></div>
              <Button type="submit" className="w-full" disabled={loading}>{loading ? '提交中...' : '提交申请'}</Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
