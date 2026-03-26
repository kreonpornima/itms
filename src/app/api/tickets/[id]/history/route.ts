import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const ticketId = parseInt(params.id);

    const history = await prisma.ticketHistory.findMany({
      where: { ticketId },
      include: {
        user: { select: { id: true, fullName: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(history);
  } catch (error: any) {
    console.error('GET history error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
