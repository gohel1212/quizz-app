// app/api/admin/leads/route.js
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin, unauthorized } from '@/lib/adminAuth';

export async function GET(req) {
  if (!verifyAdmin(req)) return unauthorized();
  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      attempt: { select: { score: true, totalQ: true, passed: true, completedAt: true } },
      notes: { orderBy: { createdAt: 'desc' } },
    },
  });
  return NextResponse.json({ leads });
}
