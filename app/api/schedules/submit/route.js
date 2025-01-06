import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '../../auth/[...nextauth]/route';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    // Add logging to debug the request
    console.log('Received schedule submission request');
    
    const session = await getServerSession(authOptions);
    console.log('Session:', session);
    
    if (!session?.user) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized' 
      }, { 
        status: 401 
      });
    }

    const scheduleData = await request.json();
    console.log('Schedule data:', scheduleData);
    
    // Create the schedule record
    const schedule = await prisma.schedule.create({
      data: {
        userId: session.user.id,
        managerId: scheduleData.managerId,
        month: scheduleData.month,
        year: scheduleData.year,
        shifts: JSON.stringify(scheduleData.shifts),
        totalHours: scheduleData.totalHours.toString(),
        status: 'PENDING',
        employeeName: scheduleData.employeeName,
        position: scheduleData.position,
        notes: scheduleData.notes || '',
        timeOff: scheduleData.timeOff || ''
      }
    });

    return NextResponse.json({
      success: true,
      data: schedule
    });

  } catch (error) {
    console.error('Schedule submission error:', {
      message: error.message,
      stack: error.stack
    });
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to submit schedule'
    }, { 
      status: 500 
    });
  }
}