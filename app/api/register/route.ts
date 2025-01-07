import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name, password } = body;

    if (!email || !name || !password) {
      return new NextResponse('Missing fields', { status: 400 });
    }

    const exist = await prisma.user.findUnique({
      where: {
        email
      }
    });

    if (exist) {
      return new NextResponse('Email already exists', { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: UserRole.STUDENT  // Changed to use STUDENT role for new registrations
      }
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('Registration error:', error);
    return new NextResponse(
      'Internal Server Error: ' + (error instanceof Error ? error.message : 'Unknown error'),
      { status: 500 }
    );
  }
}