import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

// app/api/register/route.ts
export async function POST(request: Request) {
    const prisma = new PrismaClient();
    try {
      const body = await request.json();
      console.log('Registration attempt for:', body.email);  // Log registration attempt
  
      const { email, name, password } = body;
  
      if (!email || !name || !password) {
        console.log('Missing fields:', { email: !!email, name: !!name, password: !!password });
        return new NextResponse('Missing fields', { status: 400 });
      }
  
      const exist = await prisma.user.findUnique({
        where: { email }
      });
  
      if (exist) {
        console.log('Email already exists:', email);
        return new NextResponse('Email already exists', { status: 400 });
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
  
      const user = await prisma.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
          role: UserRole.STUDENT
        }
      });
  
      console.log('User created successfully:', email);
      return NextResponse.json(user);
    } catch (error) {
      console.error('Registration error details:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      return new NextResponse(
        `Internal Server Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        { status: 500 }
      );
    } finally {
      await prisma.$disconnect();
    }
  }