import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin, unauthorized } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function POST(req, { params }) {
  if (!verifyAdmin(req)) return unauthorized();

  try {
    const { message, author } = await req.json();

    if (!message || message.trim() === '') {
      return NextResponse.json({ error: 'Message cannot be empty.' }, { status: 400 });
    }

    const newNote = await prisma.leadNote.create({
      data: {
        leadId: params.id,
        message: message.trim(),
        author: author || 'Admin',
      },
    });

    return NextResponse.json({ ok: true, note: newNote });
  } catch (err) {
    console.error('add lead note error:', err);
    return NextResponse.json({ error: 'Failed to add lead note.' }, { status: 500 });
  }
}
