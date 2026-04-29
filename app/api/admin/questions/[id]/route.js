// app/api/admin/questions/[id]/route.js
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin, unauthorized } from '@/lib/adminAuth';

export async function PUT(req, { params }) {
  if (!verifyAdmin(req)) return unauthorized();
  const body = await req.json();
  const q = await prisma.question.update({ where: { id: params.id }, data: body });
  return NextResponse.json({ question: q });
}

export async function DELETE(req, { params }) {
  if (!verifyAdmin(req)) return unauthorized();
  await prisma.question.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
