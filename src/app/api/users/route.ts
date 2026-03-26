import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const sp = request.nextUrl.searchParams;
    const where: any = { isActive: true };
    if (sp.get('role')) where.role = sp.get('role');

    const users = await prisma.user.findMany({
      where,
      select: { id: true, username: true, email: true, fullName: true, role: true, department: true },
      orderBy: { fullName: 'asc' },
    });

    return NextResponse.json(users);
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
