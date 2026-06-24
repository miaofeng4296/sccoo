import { handleCommentsGET, handleCommentsPOST, handleCommentsDELETE } from '@/lib/comments';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const targetId = parseInt(id);
  if (isNaN(targetId)) {
    return new Response(JSON.stringify({ error: '无效的信息ID' }), { status: 400 });
  }
  return handleCommentsGET(request, 'post', targetId);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const targetId = parseInt(id);
  if (isNaN(targetId)) {
    return new Response(JSON.stringify({ error: '无效的信息ID' }), { status: 400 });
  }
  return handleCommentsPOST(request, 'post', targetId);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const targetId = parseInt(id);
  if (isNaN(targetId)) {
    return new Response(JSON.stringify({ error: '无效的信息ID' }), { status: 400 });
  }
  return handleCommentsDELETE(request, 'post', targetId);
}
