// You can create a test API route to verify database connection
// app/api/test-db/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    await prisma.$connect();
    return NextResponse.json({ status: 'Database connected successfully' });
  } catch (error) {
    console.error('Database connection error:', error);
    return new NextResponse(
      'Database connection failed: ' + (error instanceof Error ? error.message : 'Unknown error'),
      { status: 500 }
    );
  }
}