import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from 'next-auth';

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
  
      // Fetch schedules for the logged-in manager
    const schedules = await prisma.schedule.findMany({
        where: {
          managerId: session.user.id
        },
        select: {
          id: true,
          employeeName: true,
          month: true,
          year: true,
          status: true,
          totalHours: true,
          approvalDate: true,
          type: true,    // Make sure this field exists in your schema
          managerId: true,
          createdAt: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      // Log the schedules for debugging
      console.log('Fetched schedules:', schedules);

      return NextResponse.json(schedules);
  } catch (error) {
    console.error('Error fetching manager schedules:', error);
    
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

    const { scheduleId, action } = await request.json();
  
      switch (action) {
        case 'approve':
          await prisma.schedule.update({
            where: { id: scheduleId, managerId: session.user.id },
            data: { 
              status: 'APPROVED',
              approvalDate: new Date().toISOString(),
              approvedBy: session.user.name
            }
          });
          break;
        case 'reject':
          await prisma.schedule.update({
            where: { id: scheduleId, managerId: session.user.id },
            data: { status: 'REJECTED' }
          });
          break;
        case 'delete':
          await prisma.schedule.delete({
            where: { 
                id: scheduleId,
                managerId: session.user.id,
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
    }
  }