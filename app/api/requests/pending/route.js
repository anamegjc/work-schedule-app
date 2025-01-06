import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '../../auth/[...nextauth]/route';

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const pendingRequests = await prisma.scheduleRequest.findMany({
      where: {
        studentId: session.user.role === 'STUDENT' ? session.user.id : undefined,
        managerId: session.user.role === 'MANAGER' ? session.user.id : undefined,
        status: 'PENDING'
      },
      include: {
        manager: {
          select: {
            name: true,
            office: true
          }
        }
      }
    });

    return NextResponse.json(pendingRequests);
  } catch (error) {
    console.error('Error fetching pending requests:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}