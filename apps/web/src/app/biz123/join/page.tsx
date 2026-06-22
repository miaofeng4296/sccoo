'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export default function ArtistJoinPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [cities, setCities] = useState<{ id: number; name: string }[]>([]);
  const [form, setForm] = useState({ name: '', specialty: '', experienceYears: '', cityId: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetch('/api/cities').then(r => r.json()).then(setCities).catch(() => {}); }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!session?.user) { toast.error('请先登录'); router.push('/login/?jump=/biz123/join'); return; }
    if (!form.name || !form.cityId) { toast.error('请填写姓名和地区'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/artists', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: form.name, specialty: form.specialty, experienceYears: form.experienceYears ? parseInt(form.experienceYears) : null, cityId: form.cityId }) });
      if (res.ok) {
        toast.success('入驻申请已提交');
        router.push('/biz123');
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
          <CardTitle>纹身师入驻</CardTitle>
          <CardDescription>展示您的技能和作品，让更多人找到您</CardDescription>
        </CardHeader>
        <CardContent>
          {!session ? (
            <div className="text-center py-8"><p className="text-gray-500 mb-4">请先登录</p><Link href="/login/?jump=/biz123/join"><Button>去登录</Button></Link></div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-2"><Label>姓名/艺名 *</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
              <div className="space-y-2"><Label>专长</Label><Input value={form.specialty} onChange={e => setForm({...form, specialty: e.target.value})} placeholder="如：老传统、新传统、写实..." /></div>
              <div className="space-y-2"><Label>从业年限</Label><Input type="number" value={form.experienceYears} onChange={e => setForm({...form, experienceYears: e.target.value})} /></div>
              <div className="space-y-2"><Label>所在地区 *</Label>
                <Select value={form.cityId ? String(form.cityId) : ''} onValueChange={v => setForm({...form, cityId: parseInt(v ?? '0')})}>
                  <SelectTrigger><SelectValue placeholder="选择城市" /></SelectTrigger>
                  <SelectContent>{cities.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>{loading ? '提交中...' : '提交申请'}</Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
