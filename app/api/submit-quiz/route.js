// app/api/submit-quiz/route.js
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req) {
  try {
    const { leadId, answers } = await req.json();

    if (!leadId || !answers) {
      return NextResponse.json({ error: 'Invalid submission data.' }, { status: 400 });
    }

    // Check lead exists
    const lead = await prisma.lead.findUnique({ where: { id: leadId }, include: { attempt: true } });
    if (!lead) {
      return NextResponse.json({ error: 'Lead not found. Please restart the quiz.' }, { status: 404 });
    }

    // BLOCK re-attempts
    if (lead.attempt) {
      return NextResponse.json({
        error: 'You have already submitted this quiz. Only one attempt is allowed.',
        alreadyAttempted: true,
      }, { status: 409 });
    }

    // Fetch correct answers from DB (server-side only)
    const questions = await prisma.question.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
      take: 10,
      select: { id: true, correctAnswer: true },
    });

    // Calculate score
    let score = 0;
    for (const q of questions) {
      if (answers[q.id] === q.correctAnswer) score++;
    }

    // Get pass threshold from settings
    const settings = await prisma.settings.findUnique({ where: { id: 'singleton' } });
    const passScore = settings?.passScore ?? 7;
    const passed = score >= passScore;
    const demoLink = passed ? (settings?.demoLink || '') : '';

    // Save attempt
    const attempt = await prisma.quizAttempt.create({
      data: {
        leadId,
        score,
        totalQ: questions.length,
        passed,
        answers: JSON.stringify(answers),
      },
    });

    // Create certificate record (for all participants)
    await prisma.certificate.create({
      data: { attemptId: attempt.id },
    });

    return NextResponse.json({
      score,
      total: questions.length,
      passed,
      passScore,
      demoLink,
      leadId,
      name: lead.name,
    });
  } catch (err) {
    console.error('submit-quiz error:', err);
    return NextResponse.json({ error: 'Server error. Please try again.' }, { status: 500 });
  }
}
