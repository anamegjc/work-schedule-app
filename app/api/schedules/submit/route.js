import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '../../auth/[...nextauth]/route';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    console.log('Starting schedule submission');
    
    const session = await getServerSession(authOptions);
    console.log('Session:', session);
    
    if (!session?.user) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized' 
      }, { status: 401 });
    }

    const scheduleData = await request.json();
    console.log('Received data:', scheduleData);

    // Validate required fields
    if (!scheduleData.managerId || !scheduleData.employeeName || !scheduleData.month || !scheduleData.year) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields'
      }, { status: 400 });
    }

    // Create the schedule record
    const schedule = await prisma.schedule.create({
      data: {
        userId: session.user.id,
        managerId: scheduleData.managerId,
        month: scheduleData.month,
        year: scheduleData.year,
        shifts: scheduleData.shifts, // Prisma will automatically stringify this
        totalHours: scheduleData.totalHours.toString(),
        status: 'PENDING',
        employeeName: scheduleData.employeeName,
        position: scheduleData.position || 'Student Worker', // Provide default if missing
        notes: scheduleData.notes || null,
        timeOff: scheduleData.timeOff || null,
      }
    });

    console.log('Schedule created:', schedule);

    return NextResponse.json({
      success: true,
      data: schedule
    });

  } catch (error) {
    console.error('Schedule submission error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to submit schedule: ' + (error.message || 'Unknown error')
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}