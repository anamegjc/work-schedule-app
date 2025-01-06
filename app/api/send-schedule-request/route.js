import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { sendScheduleRequestEmail } from '@/utils/sendgrid';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const { email, name, studentId, managerId } = await request.json();
    
    const registrationLink = `${process.env.NEXT_PUBLIC_APP_URL}/register?ref=${managerId}`;
    
    await sendScheduleRequestEmail(email, registrationLink);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}