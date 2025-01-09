import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from 'next-auth';

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
        userId: session.user.id // Filter by the current user's ID
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

export async function PATCH(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized' 
      }, { 
        status: 401 
      });
    }

     // Get the current user
     const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: 'User not found' 
      }, { 
        status: 404 
      });
    }

    const { scheduleId, action } = await request.json();
  
      switch (action) {
        case 'delete':
          await prisma.schedule.delete({
            where: { 
                id: scheduleId,
                userID: session.user.id,
                status: 'PENDING'
            }
                    
          });
          break;
        default:
          return NextResponse.json(
            { success: false, error: 'Invalid action' }, 
            { status: 400 }
          );
      }
  
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('Schedule action error:', error);
      
      return NextResponse.json({
        success: false,
        error: error.message || 'Failed to perform action'
      }, { 
        status: 500 
      });
    } finally {
      await prisma.$disconnect();
    }
  }