// app/api/admin/settings/route.js
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin, unauthorized } from '@/lib/adminAuth';

export async function GET(req) {
  if (!verifyAdmin(req)) return unauthorized();
  const settings = await prisma.settings.findUnique({ where: { id: 'singleton' } });
  return NextResponse.json({ settings });
}

export async function PUT(req) {
  if (!verifyAdmin(req)) return unauthorized();
  const { passScore, demoLink, quizTitle } = await req.json();
  const settings = await prisma.settings.upsert({
    where: { id: 'singleton' },
    update: { passScore, demoLink, quizTitle },
    create: { id: 'singleton', passScore, demoLink, quizTitle },
  });
  return NextResponse.json({ settings });
}
