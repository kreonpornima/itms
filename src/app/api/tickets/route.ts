import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { createTicketSchema } from '@/lib/validations';
import { generateTicketNumber } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const sp = request.nextUrl.searchParams;
    const where: any = {};

    if (sp.get('status')) where.status = sp.get('status');
    if (sp.get('priority')) where.priority = sp.get('priority');
    if (sp.get('assigneeId')) where.assigneeId = parseInt(sp.get('assigneeId')!);
    if (sp.get('categoryId')) where.categoryId = parseInt(sp.get('categoryId')!);

    if (sp.get('search')) {
      const search = sp.get('search')!;
      where.OR = [
        { title: { contains: search } },
        { ticketNumber: { contains: search } },
        { description: { contains: search } },
      ];
    }

    if (session.role === 'USER') {
      where.requesterId = session.userId;
    }

    const tickets = await prisma.ticket.findMany({
      where,
      include: {
        requester: { select: { id: true, fullName: true, email: true, department: true } },
        assignee: { select: { id: true, fullName: true, email: true } },
        category: { select: { id: true, name: true } },
        _count: { select: { comments: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(sp.get('limit') || '100'),
    });

    return NextResponse.json(tickets);
  } catch (error: any) {
    console.error('GET /api/tickets error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const parsed = createTicketSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const data = parsed.data;

    let dueDate: Date | undefined;
    const sla = await prisma.sLAPolicy.findUnique({ where: { priority: data.priority } });
    if (sla) {
      dueDate = new Date(Date.now() + sla.resolutionTimeHours * 3600000);
    }

    const ticket = await prisma.ticket.create({
      data: {
        ticketNumber: generateTicketNumber(),
        title: data.title,
        description: data.description,
        priority: data.priority,
        categoryId: data.categoryId,
        assigneeId: data.assigneeId,
        requesterId: session.userId,
        dueDate,
        status: data.assigneeId ? 'ASSIGNED' : 'NEW',
        assignedAt: data.assigneeId ? new Date() : undefined,
      },
      include: {
        requester: { select: { id: true, fullName: true, email: true } },
        assignee: { select: { id: true, fullName: true, email: true } },
        category: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(ticket, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/tickets error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
