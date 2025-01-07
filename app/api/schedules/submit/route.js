import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '../../auth/[...nextauth]/route';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    console.log('Current session:', session);

    if (!session?.user?.email) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized' 
      }, { status: 401 });
    }

    // First, get the user by email
    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email
      }
    });

    console.log('Found user:', user);

    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: 'User not found' 
      }, { status: 404 });
    }

    const scheduleData = await request.json();
    console.log('Schedule data:', scheduleData);

    // Stringify the shifts array
    const shiftsJson = JSON.stringify(scheduleData.shifts);

    // Create the schedule record with userId and managerId directly
    const schedule = await prisma.schedule.create({
      data: {
        userId: user.id,           // Use userId directly instead of connect
        managerId: scheduleData.managerId,  // Use managerId directly
        month: scheduleData.month,
        year: scheduleData.year,
        shifts: shiftsJson,        // Use the stringified shifts
        totalHours: scheduleData.totalHours?.toString() || "0",
        status: 'PENDING',
        employeeName: scheduleData.employeeName,
        position: scheduleData.position || 'Student Worker',
        notes: scheduleData.notes || null,
        timeOff: scheduleData.timeOff || null,
      }
    });

    console.log('Created schedule:', schedule);

    return NextResponse.json({
      success: true,
      data: schedule
    });

  } catch (error) {
    console.error('Schedule submission error:', error);
    
    return NextResponse.json({
      success: false,
      error: `Failed to submit schedule: ${error.message}`
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}