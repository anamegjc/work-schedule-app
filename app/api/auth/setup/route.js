import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET() {
  try {
    console.log('Starting admin setup...');
    
    // Check if admin exists
    const adminExists = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });

    if (adminExists) {
      console.log('Admin already exists');
      return NextResponse.json({ 
        success: true,
        message: 'Admin already exists'
      });
    }

    console.log('Creating new admin account...');
    
    // Create admin account
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const admin = await prisma.user.create({
      data: {
        email: 'admin@workschedule.com',
        password: hashedPassword,
        name: 'System Administrator',
        role: 'ADMIN'
      }
    });

    console.log('Admin account created successfully:', admin.email);

    return NextResponse.json({ 
      success: true,
      message: 'Admin account created successfully'
    });
  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json({ 
      success: false,
      error: error.message || 'Internal server error'
    }, { 
      status: 500 
    });
  }
}