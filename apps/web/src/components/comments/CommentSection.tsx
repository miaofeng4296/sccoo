'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { MessageSquare, Trash2, ChevronDown } from 'lucide-react';

interface User {
  id: string;
  name: string | null;
  avatar: string | null;
}

interface CommentData {
  id: number;
  content: string;
  createdAt: string;
  userId: string;
  isDeleted: boolean;
  user: User;
  replies?: CommentData[];
}

interface Props {
  targetType: 'post' | 'article';
  targetId: number;
}

export function CommentSection({ targetType, targetId }: Props) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<CommentData[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [content, setContent] = useState('');
  const [replyTo, setReplyTo] = useState<{ id: number; name: string } | null>(null);

  const apiBase = targetType === 'post'
    ? `/api/posts/${targetId}/comments`
    : `/api/articles/${targetId}/comments`;

  const fetchComments = useCallback(async (pageNum: number) => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}?page=${pageNum}&limit=20`);
      const data = await res.json();
      if (res.ok) {
        if (pageNum === 1) {
          setComments(data.comments);
        } else {
          setComments(prev => [...prev, ...data.comments]);
        }
        setTotal(data.total);
        setHasMore(data.hasMore);
        setPage(data.page);
      }
    } catch {
      // Silent fail
    } finally {
      setLoading(false);
    }
  }, [apiBase]);

  useEffect(() => {
    fetchComments(1);
  }, [fetchComments]);

  async function submitComment() {
    if (!session?.user) {
      toast.error('请先登录');
      return;
    }
    if (!content.trim()) {
      toast.error('请输入评论内容');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(apiBase, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: content.trim(),
          parentId: replyTo?.id || null,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(replyTo ? '回复成功' : '评论成功');
        setContent('');
        setReplyTo(null);
        fetchComments(1);
      } else {
        toast.error(data.error || '评论失败');
      }
    } catch {
      toast.error('评论失败');
    } finally {
      setSubmitting(false);
    }
  }

  async function deleteComment(commentId: number) {
    if (!confirm('确定要删除这条评论吗？')) return;
    try {
      const res = await fetch(apiBase, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commentId }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('已删除');
        fetchComments(1);
      } else {
        toast.error(data.error || '删除失败');
      }
    } catch {
      toast.error('删除失败');
    }
  }

  function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
    return d.toLocaleDateString('zh-CN');
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-gray-600" />
        <h3 className="font-bold text-lg">评论{total > 0 ? ` (${total})` : ''}</h3>
      </div>

      {/* Comment Form */}
      <div className="space-y-3">
        {replyTo && (
          <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
            <span>回复 <strong>{replyTo.name}</strong></span>
            <button
              onClick={() => { setReplyTo(null); setContent(''); }}
              className="text-red-500 hover:underline ml-auto"
            >
              取消
            </button>
          </div>
        )}
        <Textarea
          placeholder={session?.user ? (replyTo ? `回复 ${replyTo.name}...` : '写下你的评论...') : '登录后发表评论'}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          disabled={!session?.user || submitting}
          className="resize-none"
        />
        <div className="flex justify-end">
          <Button
            onClick={submitComment}
            disabled={!session?.user || submitting || !content.trim()}
            size="sm"
            variant="destructive"
          >
            {submitting ? '发送中...' : replyTo ? '回复' : '发表评论'}
          </Button>
        </div>
      </div>

      {/* Comment List */}
      {loading && comments.length === 0 ? (
        <div className="space-y-3 py-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse flex gap-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-20" />
                <div className="h-3 bg-gray-200 rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <p className="text-center text-gray-400 py-8">暂无评论，来说点什么吧</p>
      ) : (
        <div className="divide-y">
          {comments.map((comment) => (
            <div key={comment.id} className="py-4">
              {/* Main comment */}
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-sm font-bold text-red-600 shrink-0">
                  {comment.user.name?.charAt(0) || '用'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{comment.user.name}</span>
                    <span className="text-xs text-gray-400">{formatDate(comment.createdAt)}</span>
                  </div>
                  <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{comment.content}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <button
                      onClick={() => {
                        setReplyTo({ id: comment.id, name: comment.user.name || '用户' });
                        setContent('');
                      }}
                      className="text-xs text-gray-400 hover:text-red-600 transition-colors"
                    >
                      回复
                    </button>
                    {session?.user && (session.user.id === comment.userId || (session.user as { role?: string }).role === 'ADMIN') && (
                      <button
                        onClick={() => deleteComment(comment.id)}
                        className="text-xs text-gray-400 hover:text-red-600 transition-colors flex items-center gap-1"
                      >
                        <Trash2 className="h-3 w-3" /> 删除
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Replies */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="ml-12 mt-2 space-y-3 bg-gray-50 rounded-lg p-3">
                  {comment.replies.map((reply) => (
                    <div key={reply.id} className="flex gap-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-600 shrink-0">
                        {reply.user.name?.charAt(0) || '回'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-xs">{reply.user.name}</span>
                          <span className="text-xs text-gray-400">{formatDate(reply.createdAt)}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-0.5">{reply.content}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <button
                            onClick={() => {
                              setReplyTo({ id: comment.id, name: reply.user.name || '用户' });
                              setContent('');
                            }}
                            className="text-xs text-gray-400 hover:text-red-600"
                          >
                            回复
                          </button>
                          {session?.user && (session.user.id === reply.userId || (session.user as { role?: string }).role === 'ADMIN') && (
                            <button
                              onClick={() => deleteComment(reply.id)}
                              className="text-xs text-gray-400 hover:text-red-600 flex items-center gap-1"
                            >
                              <Trash2 className="h-3 w-3" /> 删除
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Load More */}
      {hasMore && (
        <div className="text-center pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fetchComments(page + 1)}
            disabled={loading}
            className="text-gray-500"
          >
            <ChevronDown className="h-4 w-4 mr-1" />
            {loading ? '加载中...' : '加载更多'}
          </Button>
        </div>
      )}
    </div>
  );
}
