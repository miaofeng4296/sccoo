import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@sccoo/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, User } from 'lucide-react';
import { AnswerForm } from './AnswerForm';

export const revalidate = 60;

interface Props {
  params: Promise<{ id: string }>;
}

export default async function QADetailPage({ params }: Props) {
  const { id } = await params;
  const questionId = parseInt(id);
  if (isNaN(questionId)) notFound();

  const question = await prisma.qaQuestion.findUnique({
    where: { id: questionId },
    include: {
      user: { select: { name: true } },
      answers: {
        include: { user: { select: { name: true } } },
        orderBy: [{ isAccepted: 'desc' }, { createdAt: 'asc' }],
      },
    },
  });

  if (!question) notFound();

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="text-sm text-gray-500 mb-4">
        <Link href="/" className="hover:text-red-600">首页</Link>
        {' > '}
        <Link href="/wenda/" className="hover:text-red-600">纹身问答</Link>
        {' > '}
        <span>{question.title}</span>
      </div>

      {/* Question */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            {question.isResolved && (
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                <CheckCircle className="h-3 w-3 mr-1" /> 已解决
              </Badge>
            )}
          </div>
          <CardTitle className="text-xl">{question.title}</CardTitle>
          <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
            <span className="flex items-center gap-1"><User className="h-4 w-4" /> {question.user.name}</span>
            <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {question.createdAt.toLocaleDateString('zh-CN')}</span>
            <span>浏览 {question.viewCount}</span>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 whitespace-pre-wrap">{question.content}</p>
        </CardContent>
      </Card>

      {/* Answers */}
      <div className="mb-6">
        <h2 className="text-lg font-bold mb-4">{question.answerCount} 个回答</h2>
        {question.answers.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-gray-400">暂无回答，来写第一个回答吧</CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {question.answers.map((answer) => (
              <Card key={answer.id} className={answer.isAccepted ? 'border-green-300 bg-green-50' : ''}>
                <CardContent className="p-4">
                  {answer.isAccepted && (
                    <Badge className="mb-2 bg-green-500"><CheckCircle className="h-3 w-3 mr-1" /> 最佳答案</Badge>
                  )}
                  <p className="text-gray-700 whitespace-pre-wrap">{answer.content}</p>
                  <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><User className="h-3 w-3" /> {answer.user.name}</span>
                    <span>{answer.createdAt.toLocaleDateString('zh-CN')}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Answer Form */}
      <AnswerForm questionId={question.id} />

      <div className="text-center mt-6">
        <Link href="/wenda/" className="text-sm text-gray-500 hover:text-red-600">
          &larr; 返回问答列表
        </Link>
      </div>
    </div>
  );
}
