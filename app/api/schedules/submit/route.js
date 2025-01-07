import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '../../auth/[...nextauth]/route';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    console.log('Current session:', session);

    if (!session?.user?.studentId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized - No user ID found' 
      }, { status: 401 });
    }

    // Get user by email
    const user = await prisma.user.findUnique({
      where: { studentId: session.user.studentId }
    });

    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: 'User not found' 
      }, { status: 404 });
    }

    const scheduleData = await request.json();
    console.log('Schedule data:', scheduleData);

    // Create the schedule record with proper user and manager connections
    const schedule = await prisma.schedule.create({
      data: {
        user: {
          connect: { studentId: session.user.studentId }  // Connect existing user
        },
        manager: {
          connect: { id: scheduleData.managerId }  // Connect existing manager
        },
        month: scheduleData.month,
        year: scheduleData.year,
        shifts: scheduleData.shifts,
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
    console.error('Schedule submission error:', {
      error: error.message,
      stack: error.stack
    });
    
    return NextResponse.json({
      success: false,
      error: `Failed to submit schedule: ${error.message}`
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}