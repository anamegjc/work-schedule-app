import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const managers = await prisma.user.findMany({
      where: { role: 'MANAGER' },
      select: {
        id: true,
        name: true,
        office: true,
        email: true
      }
    });
    return NextResponse.json(managers);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}