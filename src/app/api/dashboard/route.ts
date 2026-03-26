import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Counts
    const [totalOpen, totalUrgent, totalBreached, resolvedToday] = await Promise.all([
      prisma.ticket.count({ where: { status: { in: ['NEW', 'ASSIGNED', 'IN_PROGRESS', 'ON_HOLD'] } } }),
      prisma.ticket.count({ where: { priority: 'URGENT', status: { notIn: ['RESOLVED', 'CLOSED'] } } }),
      prisma.sLABreach.count({ where: { resolvedAt: null } }),
      prisma.ticket.count({ where: { resolvedAt: { gte: todayStart } } }),
    ]);

    // Avg resolution time (for resolved tickets in last 30 days)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 3600000);
    const resolvedTickets = await prisma.ticket.findMany({
      where: { resolvedAt: { gte: thirtyDaysAgo }, status: { in: ['RESOLVED', 'CLOSED'] } },
      select: { createdAt: true, resolvedAt: true },
    });
    let avgResolutionHours = 0;
    if (resolvedTickets.length > 0) {
      const totalHours = resolvedTickets.reduce((sum, t) => {
        if (!t.resolvedAt) return sum;
        return sum + (t.resolvedAt.getTime() - t.createdAt.getTime()) / 3600000;
      }, 0);
      avgResolutionHours = Math.round(totalHours / resolvedTickets.length);
    }

    // By status
    const byStatus = await prisma.ticket.groupBy({
      by: ['status'],
      _count: { status: true },
    });
    const ticketsByStatus = byStatus.map((s) => ({ status: s.status, count: s._count.status }));

    // By priority (open only)
    const byPriority = await prisma.ticket.groupBy({
      by: ['priority'],
      where: { status: { notIn: ['RESOLVED', 'CLOSED'] } },
      _count: { priority: true },
    });
    const ticketsByPriority = byPriority.map((p) => ({ priority: p.priority, count: p._count.priority }));

    // Recent tickets
    const recentTickets = await prisma.ticket.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        requester: { select: { id: true, fullName: true } },
        assignee: { select: { id: true, fullName: true } },
        category: { select: { id: true, name: true } },
      },
    });

    // 7-day trend
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 3600000);
    const recentAll = await prisma.ticket.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      select: { createdAt: true },
    });
    const dailyMap: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 3600000);
      const key = d.toISOString().slice(0, 10);
      dailyMap[key] = 0;
    }
    recentAll.forEach((t) => {
      const key = t.createdAt.toISOString().slice(0, 10);
      if (dailyMap[key] !== undefined) dailyMap[key]++;
    });
    const dailyTrend = Object.entries(dailyMap).map(([date, count]) => ({ date, count }));

    return NextResponse.json({
      totalOpen,
      totalUrgent,
      totalBreached,
      resolvedToday,
      avgResolutionHours,
      ticketsByStatus,
      ticketsByPriority,
      recentTickets,
      dailyTrend,
    });
  } catch (error: any) {
    console.error('Dashboard error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
