// app/api/schedules/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';

const prisma = new PrismaClient();

type RouteContext = {
  params: { 
    id: string 
  };
};

export async function GET(
  _request: NextRequest, 
  context: RouteContext
): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const schedule = await prisma.schedule.findUnique({
      where: {
        id: context.params.id,
      },
      include: {
        manager: true,
      }
    });

    if (!schedule) {
      return NextResponse.json(
        { error: 'Schedule not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(schedule);
  } catch (error) {
    console.error('Error fetching schedule:', error);
    return NextResponse.json(
      { error: 'Failed to fetch schedule' },
      { status: 500 }
    );
  }
}