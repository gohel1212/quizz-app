// app/api/questions/route.js
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const questions = await prisma.question.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
      take: 10,
      select: {
        id: true,
        question: true,
        optionA: true,
        optionB: true,
        optionC: true,
        optionD: true,
        order: true,
        // NOTE: correctAnswer is NOT included here — never expose to client
      },
    });

    return NextResponse.json({ questions });
  } catch (err) {
    console.error('questions error:', err);
    return NextResponse.json({ error: 'Failed to fetch questions.' }, { status: 500 });
  }
}
