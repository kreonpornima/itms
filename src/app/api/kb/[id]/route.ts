import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const articleId = parseInt(params.id);

    const article = await prisma.kBArticle.findUnique({
      where: { id: articleId },
      include: {
        category: { select: { id: true, name: true } },
        creator: { select: { fullName: true } },
      },
    });

    if (!article) return NextResponse.json({ error: 'Article not found' }, { status: 404 });

    // Increment view count
    await prisma.kBArticle.update({
      where: { id: articleId },
      data: { viewCount: { increment: 1 } },
    });

    return NextResponse.json(article);
  } catch (error: any) {
    console.error('GET /api/kb/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
