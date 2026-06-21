'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { POST_TYPE_LABELS } from '@sccoo/shared';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const postTypes = Object.entries(POST_TYPE_LABELS);

export default function PostCreatePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    content: '',
    type: '',
    categoryId: 0,
    cityId: 0,
    priceMin: '',
    priceMax: '',
    contactName: '',
    contactPhone: '',
    contactWechat: '',
  });

  // Simple city list (matches seed data subdomains)
  const cities = [
    { id: 1, name: '北京' }, { id: 2, name: '上海' }, { id: 3, name: '天津' }, { id: 4, name: '重庆' },
    { id: 5, name: '济南' }, { id: 6, name: '青岛' }, { id: 7, name: '南京' }, { id: 8, name: '苏州' },
    { id: 9, name: '杭州' }, { id: 10, name: '宁波' }, { id: 11, name: '广州' }, { id: 12, name: '深圳' },
    { id: 13, name: '东莞' }, { id: 14, name: '长沙' }, { id: 15, name: '岳阳' }, { id: 16, name: '武汉' },
    { id: 17, name: '成都' },
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!session?.user) {
      toast.error('请先登录后再发布信息');
      router.push('/login/?jump=/post/');
      return;
    }

    if (!form.title || !form.content || !form.type || !form.cityId) {
      toast.error('请填写标题、内容、类型和地区');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          content: form.content,
          type: form.type,
          categoryId: 2, // Default to job category
          cityId: form.cityId,
          priceMin: form.priceMin ? parseInt(form.priceMin) : undefined,
          priceMax: form.priceMax ? parseInt(form.priceMax) : undefined,
          contactName: form.contactName || undefined,
          contactPhone: form.contactPhone || undefined,
          contactWechat: form.contactWechat || undefined,
          images: [],
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        toast.success('信息发布成功！');
        router.push(`/xinxi/${data.id}`);
        router.refresh();
      } else {
        const err = await res.json();
        toast.error(err.error || '发布失败');
      }
    } catch {
      toast.error('网络错误，请重试');
    }

    setLoading(false);
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <Card>
        <CardHeader>
          <CardTitle>发布信息</CardTitle>
          <CardDescription>选择分类，填写信息详情，发布到秀酷纹身之家</CardDescription>
        </CardHeader>
        <CardContent>
          {!session ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">请先登录后再发布信息</p>
              <Link href="/login/?jump=/post/">
                <Button>去登录</Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Type */}
              <div className="space-y-2">
                <Label>信息类型 *</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v ?? '' })}>
                  <SelectTrigger>
                    <SelectValue placeholder="请选择信息类型" />
                  </SelectTrigger>
                  <SelectContent>
                    {postTypes.map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* City */}
              <div className="space-y-2">
                <Label>所在地区 *</Label>
                <Select value={String(form.cityId)} onValueChange={(v) => setForm({ ...form, cityId: parseInt(v ?? '0') })}>
                  <SelectTrigger>
                    <SelectValue placeholder="请选择地区" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((city) => (
                      <SelectItem key={city.id} value={String(city.id)}>{city.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label>标题 *</Label>
                <Input
                  placeholder="例如：深圳招聘老传统熟手师傅"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  maxLength={200}
                />
              </div>

              {/* Content */}
              <div className="space-y-2">
                <Label>详细内容 *</Label>
                <Textarea
                  placeholder="请详细描述信息内容..."
                  rows={6}
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  maxLength={5000}
                />
              </div>

              {/* Price */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>最低薪资/价格</Label>
                  <Input
                    type="number"
                    placeholder="例如：8000"
                    value={form.priceMin}
                    onChange={(e) => setForm({ ...form, priceMin: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>最高薪资/价格</Label>
                  <Input
                    type="number"
                    placeholder="例如：20000"
                    value={form.priceMax}
                    onChange={(e) => setForm({ ...form, priceMax: e.target.value })}
                  />
                </div>
              </div>

              {/* Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>联系人</Label>
                  <Input
                    placeholder="姓名"
                    value={form.contactName}
                    onChange={(e) => setForm({ ...form, contactName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>联系电话</Label>
                  <Input
                    placeholder="手机号"
                    value={form.contactPhone}
                    onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>微信</Label>
                  <Input
                    placeholder="微信号"
                    value={form.contactWechat}
                    onChange={(e) => setForm({ ...form, contactWechat: e.target.value })}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? '发布中...' : '发布信息'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
