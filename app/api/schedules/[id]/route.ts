// app/api/schedules/[id]/route.ts
import { type NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';

const prisma = new PrismaClient();

// Remove all type definitions and let Next.js infer them
export async function GET(
  request: NextRequest,
  { params }: any
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const schedule = await prisma.schedule.findUnique({
      where: {
        id: params.id,
      },
      include: {
        manager: true,
      }
    });

    if (!schedule) {
      return Response.json(
        { error: 'Schedule not found' },
        { status: 404 }
      );
    }

    return Response.json(schedule);
  } catch (error) {
    console.error('Error fetching schedule:', error);
    return Response.json(
      { error: 'Failed to fetch schedule' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}