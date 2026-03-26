import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { updateTicketSchema } from '@/lib/validations';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const ticket = await prisma.ticket.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        requester: { select: { id: true, fullName: true, email: true, department: true, role: true } },
        assignee: { select: { id: true, fullName: true, email: true, role: true } },
        category: { select: { id: true, name: true } },
        _count: { select: { comments: true } },
      },
    });

    if (!ticket) return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });

    return NextResponse.json(ticket);
  } catch (error: any) {
    console.error('GET /api/tickets/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const ticketId = parseInt(params.id);
    const body = await request.json();
    const parsed = updateTicketSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const current = await prisma.ticket.findUnique({ where: { id: ticketId } });
    if (!current) return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });

    const data = parsed.data;
    const userId = session.userId;

    // Track changes
    const changes: { field: string; oldValue: string | null; newValue: string | null }[] = [];
    if (data.priority && data.priority !== current.priority) {
      changes.push({ field: 'priority', oldValue: current.priority, newValue: data.priority });
    }
    if (data.status && data.status !== current.status) {
      changes.push({ field: 'status', oldValue: current.status, newValue: data.status });
    }
    if (data.assigneeId !== undefined && data.assigneeId !== current.assigneeId) {
      changes.push({ field: 'assignee', oldValue: String(current.assigneeId || ''), newValue: String(data.assigneeId || '') });
    }

    const updateData: any = { updatedAt: new Date() };
    if (data.title) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.priority) updateData.priority = data.priority;
    if (data.status) updateData.status = data.status;
    if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;
    if (data.assigneeId !== undefined) {
      updateData.assigneeId = data.assigneeId;
      if (data.assigneeId && !current.assignedAt) updateData.assignedAt = new Date();
    }
    if (data.resolutionNotes !== undefined) updateData.resolutionNotes = data.resolutionNotes;

    if (data.status === 'RESOLVED' && current.status !== 'RESOLVED') updateData.resolvedAt = new Date();
    if (data.status === 'CLOSED' && current.status !== 'CLOSED') updateData.closedAt = new Date();

    const ticket = await prisma.ticket.update({
      where: { id: ticketId },
      data: updateData,
      include: {
        requester: { select: { id: true, fullName: true, email: true, department: true } },
        assignee: { select: { id: true, fullName: true, email: true } },
        category: { select: { id: true, name: true } },
      },
    });

    // Log history
    for (const c of changes) {
      await prisma.ticketHistory.create({
        data: { ticketId, fieldChanged: c.field, oldValue: c.oldValue, newValue: c.newValue, changedBy: userId },
      });
    }

    return NextResponse.json(ticket);
  } catch (error: any) {
    console.error('PATCH /api/tickets/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
