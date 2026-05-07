import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin, unauthorized } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function PUT(req, { params }) {
  if (!verifyAdmin(req)) return unauthorized();

  try {
    const { stage, description, lastContact } = await req.json();
    
    // update lead
    const updatedLead = await prisma.lead.update({
      where: { id: params.id },
      data: {
        ...(stage && { stage }),
        ...(description !== undefined && { description }),
        ...(lastContact !== undefined && { lastContact: lastContact ? new Date(lastContact) : null }),
      },
      include: { attempt: true },
    });

    return NextResponse.json({ ok: true, lead: updatedLead });
  } catch (err) {
    console.error('update lead error:', err);
    return NextResponse.json({ error: 'Failed to update lead.' }, { status: 500 });
  }
}

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
