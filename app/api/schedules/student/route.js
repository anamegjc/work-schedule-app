import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '../../auth/[...nextauth]/route';

const prisma = new PrismaClient();

export async function GET(request) {
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

    // Fetch schedules for the logged-in student
    const schedules = await prisma.schedule.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(schedules);
  } catch (error) {
    console.error('Error fetching student schedules:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch schedules'
    }, { 
      status: 500 
    });
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

    // Parse the request body
    const { scheduleId, action } = await request.json();

    // Validate input
    if (!scheduleId || !action) {
      return NextResponse.json({
        success: false,
        error: 'Schedule ID and action are required'
      }, {
        status: 400
      });
    }

    // Perform the requested action
    switch (action) {
      case 'approve':
        await prisma.schedule.update({
          where: { 
            id: scheduleId, 
            userId: session.user.id,
            status: 'PENDING'
          },
          data: { 
            status: 'APPROVED',
            approvalDate: new Date().toISOString()
          }
        });
        break;

      case 'reject':
        await prisma.schedule.update({
          where: { 
            id: scheduleId, 
            userId: session.user.id,
            status: 'PENDING'
          },
          data: { 
            status: 'REJECTED' 
          }
        });
        break;

      case 'delete':
        await prisma.schedule.delete({
          where: { 
            id: scheduleId, 
            userId: session.user.id,
            status: 'PENDING'
          }
        });
        break;

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action'
        }, {
          status: 400
        });
    }

    return NextResponse.json({
      success: true,
      message: `Schedule ${action}d successfully`
    });

  } catch (error) {
    console.error('Error processing schedule action:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to process schedule action'
    }, { 
      status: 500 
    });
  }
}