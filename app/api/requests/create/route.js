import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '../../auth/[...nextauth]/route';
import { sendScheduleRequestEmail } from '@/utils/sendgrid';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'MANAGER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { studentId } = body;

    // Check if student exists and is managed by this manager
    const student = await prisma.user.findFirst({
      where: {
        id: studentId,
        managerId: session.user.id,
        role: 'STUDENT'
      }
    });

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found or not authorized' },
        { status: 404 }
      );
    }

    // Create schedule request
    const scheduleRequest = await prisma.scheduleRequest.create({
      data: {
        managerId: session.user.id,
        studentId: studentId,
        status: 'PENDING'
      }
    });

    // Send email notification
    await sendScheduleRequestEmail(
      student.email,
      session.user.name,
      session.user.office
    );

    return NextResponse.json(scheduleRequest, { status: 201 });
  } catch (error) {
    console.error('Error creating schedule request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}