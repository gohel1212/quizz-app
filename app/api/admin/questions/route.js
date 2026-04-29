// app/api/admin/questions/route.js
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin, unauthorized } from '@/lib/adminAuth';

export async function GET(req) {
  if (!verifyAdmin(req)) return unauthorized();
  const questions = await prisma.question.findMany({ orderBy: { order: 'asc' } });
  return NextResponse.json({ questions });
}

export async function POST(req) {
  if (!verifyAdmin(req)) return unauthorized();
  const body = await req.json();
  const q = await prisma.question.create({ data: body });
  return NextResponse.json({ question: q });
}
