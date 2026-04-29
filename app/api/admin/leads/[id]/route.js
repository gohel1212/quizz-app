import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin, unauthorized } from '@/lib/adminAuth';

export async function DELETE(req, { params }) {
  if (!verifyAdmin(req)) return unauthorized();

  try {
    const lead = await prisma.lead.findUnique({
      where: { id: params.id },
      include: { attempt: { include: { certificate: true } } },
    });

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found.' }, { status: 404 });
    }

    if (lead.attempt?.certificate) {
      await prisma.certificate.delete({ where: { id: lead.attempt.certificate.id } });
    }

    if (lead.attempt) {
      await prisma.quizAttempt.delete({ where: { id: lead.attempt.id } });
    }

    await prisma.lead.delete({ where: { id: lead.id } });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('delete lead error:', err);
    return NextResponse.json({ error: 'Failed to delete lead.' }, { status: 500 });
  }
}
