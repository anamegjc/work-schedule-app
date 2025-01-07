// app/api/test-db/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Test the connection
    await prisma.$connect();
    
    // Try to get a count of users
    const userCount = await prisma.user.count();
    
    return NextResponse.json({ 
      status: 'Connected to database', 
      userCount: userCount 
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ 
      error: 'Database connection failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}