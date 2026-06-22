'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { toast } from 'sonner';

export function FavoriteButton({ postId }: { postId: number }) {
  const { data: session } = useSession();
  const [favorited, setFavorited] = useState(false);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/favorites?postId=${postId}`)
      .then(r => r.json())
      .then(data => {
        setCount(data.count || 0);
        setFavorited(data.isFavorited || false);
      })
      .catch(() => {});
  }, [postId]);

  async function toggle() {
    if (!session?.user) {
      toast.error('请先登录');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId }),
      });
      if (res.ok) {
        const data = await res.json();
        setFavorited(data.favorited);
        setCount(prev => data.favorited ? prev + 1 : prev - 1);
        toast.success(data.message);
      }
    } catch {
      toast.error('操作失败');
    }
    setLoading(false);
  }

  return (
    <Button
      className="w-full"
      variant={favorited ? 'destructive' : 'outline'}
      size="sm"
      disabled={loading}
      onClick={toggle}
    >
      <Heart className={`h-4 w-4 mr-2 ${favorited ? 'fill-current' : ''}`} />
      {favorited ? `已收藏 (${count})` : `收藏信息 (${count})`}
    </Button>
  );
}
