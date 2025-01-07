import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/app/lib/auth';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'MANAGER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { scheduleId } = body;

    const schedule = await prisma.schedule.findFirst({
      where: {
        id: scheduleId,
        managerId: session.user.id
      }
    });

    if (!schedule) {
      return NextResponse.json(
        { error: 'Schedule not found or not authorized' },
        { status: 404 }
      );
    }

    const updatedSchedule = await prisma.schedule.update({
      where: { id: scheduleId },
      data: {
        status: 'APPROVED',
        approvedBy: session.user.name,
        approvalDate: new Date().toISOString()
      }
    });

    return NextResponse.json(updatedSchedule);
  } catch (error) {
    console.error('Error approving schedule:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  // Your existing route logic here
}