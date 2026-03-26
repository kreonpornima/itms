import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const sp = request.nextUrl.searchParams;
    const where: any = { isPublished: true };

    if (sp.get('search')) {
      const search = sp.get('search')!;
      where.OR = [
        { title: { contains: search } },
        { content: { contains: search } },
        { keywords: { contains: search } },
      ];
    }

    if (sp.get('categoryId')) where.categoryId = parseInt(sp.get('categoryId')!);

    const articles = await prisma.kBArticle.findMany({
      where,
      include: {
        category: { select: { id: true, name: true } },
        creator: { select: { fullName: true } },
      },
      orderBy: [{ helpfulCount: 'desc' }, { viewCount: 'desc' }],
    });

    return NextResponse.json(articles);
  } catch (error: any) {
    console.error('GET /api/kb error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
