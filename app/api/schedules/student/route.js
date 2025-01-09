import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '../../auth/[...nextauth]/route';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the current user's ID
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Fetch only schedules belonging to the current user
    const schedules = await prisma.schedule.findMany({
      where: {
        userId: user.id // Filter by the current user's ID
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(schedules);

  } catch (error) {
    console.error('Error fetching schedules:', error);
    return NextResponse.json(
      { error: 'Failed to fetch schedules' }, 
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}