import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { createCommentSchema } from '@/lib/validations';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const ticketId = parseInt(params.id);
    const userRole = session.role;

    const where: any = { ticketId };
    // Regular users cannot see internal comments
    if (userRole === 'USER') where.isInternal = false;

    const comments = await prisma.ticketComment.findMany({
      where,
      include: {
        user: { select: { id: true, fullName: true, email: true, role: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json(comments);
  } catch (error: any) {
    console.error('GET comments error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const ticketId = parseInt(params.id);
    const body = await request.json();
    const parsed = createCommentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const userId = (session as any).userId;

    const comment = await prisma.ticketComment.create({
      data: {
        ticketId,
        userId,
        commentText: parsed.data.commentText,
        isInternal: parsed.data.isInternal,
      },
      include: {
        user: { select: { id: true, fullName: true, email: true, role: true } },
      },
    });

    // Update ticket timestamp
    await prisma.ticket.update({ where: { id: ticketId }, data: { updatedAt: new Date() } });

    // Set first response time
    if (!parsed.data.isInternal) {
      await prisma.ticket.updateMany({
        where: { id: ticketId, firstResponseAt: null },
        data: { firstResponseAt: new Date() },
      });
    }

    return NextResponse.json(comment, { status: 201 });
  } catch (error: any) {
    console.error('POST comment error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
