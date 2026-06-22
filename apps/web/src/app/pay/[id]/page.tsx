'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { PIN_PRICES } from '@sccoo/shared';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { CheckCircle, Clock } from 'lucide-react';

const pinOptions = Object.entries(PIN_PRICES).map(([key, val]) => ({ ...val, key }));

export default function PayPage() {
  const { id } = useParams<{ id: string }>();
  const { data: session } = useSession();
  const router = useRouter();
  const [selected, setSelected] = useState('');
  const [loading, setLoading] = useState(false);
  const [orderCreated, setOrderCreated] = useState<{ orderNo: string; amount: number } | null>(null);
  const [post, setPost] = useState<{ title: string; isPinned: boolean } | null>(null);

  useEffect(() => {
    fetch(`/api/posts?id=${id}`).then(r => r.json()).then(data => {
      setPost(data);
    }).catch(() => {});
  }, [id]);

  const selectedOption = pinOptions.find(o => o.key === selected);

  async function handleCreateOrder() {
    if (!selected || !selectedOption) return;

    setLoading(true);
    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: parseInt(id!),
          pinType: selectedOption.key,
          pinDays: selectedOption.days,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setOrderCreated(data);
        toast.success('订单创建成功！');
      } else {
        const err = await res.json();
        toast.error(err.error || '创建订单失败');
      }
    } catch {
      toast.error('网络错误');
    }
    setLoading(false);
  }

  if (!session) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <p className="text-gray-500 mb-4">请先登录</p>
        <Link href={`/login/?jump=/pay/${id}`}><Button>去登录</Button></Link>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <Card>
        <CardHeader>
          <CardTitle>信息置顶推广</CardTitle>
          <CardDescription>
            {post ? (
              <>为 &quot;{post.title}&quot; 购买置顶服务</>
            ) : (
              '选择置顶方案，让您的信息获得更多曝光'
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {orderCreated ? (
            <div className="text-center py-8 space-y-4">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
              <h3 className="text-lg font-bold">订单已创建</h3>
              <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-2">
                <p>订单号：<strong className="font-mono">{orderCreated.orderNo}</strong></p>
                <p>金额：<strong className="text-red-600 text-lg">¥{orderCreated.amount}</strong></p>
              </div>
              <p className="text-sm text-gray-500">
                <Clock className="h-4 w-4 inline mr-1" />
                请联系客服完成支付<br />
                微信：sccoocn | QQ：4883699
              </p>
              <Link href={`/xinxi/${id}`}>
                <Button variant="outline" className="w-full">返回信息页</Button>
              </Link>
            </div>
          ) : (
            <>
              {/* Pin Options */}
              <div className="space-y-3">
                {pinOptions.map((option) => (
                  <div
                    key={option.key}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      selected === option.key
                        ? 'border-red-500 bg-red-50 shadow-sm'
                        : 'hover:border-gray-300'
                    }`}
                    onClick={() => setSelected(option.key)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge variant={selected === option.key ? 'destructive' : 'secondary'}>
                            {option.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          有效期 {option.days} 天 · 优先展示
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-red-600">¥{option.price}</p>
                        <p className="text-xs text-gray-400">/{option.days}天</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {selectedOption && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between text-sm">
                    <span>方案</span>
                    <span>{selectedOption.label}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span>天数</span>
                    <span>{selectedOption.days} 天</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t">
                    <span>合计</span>
                    <span className="text-red-600">¥{selectedOption.price}</span>
                  </div>
                </div>
              )}

              <Button
                className="w-full"
                disabled={!selected || loading}
                onClick={handleCreateOrder}
              >
                {loading ? '创建订单中...' : '提交订单'}
              </Button>

              <p className="text-xs text-gray-400 text-center">
                提交后请联系客服完成支付，支付确认后立即生效
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
