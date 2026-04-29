// app/api/submit-form/route.js
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req) {
  try {
    const { name, college, mobile, email } = await req.json();

    // Validation
    if (!name || !college || !mobile || !email) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }
    if (!/^[6-9][0-9]{9}$/.test(mobile)) {
      return NextResponse.json({ error: 'Please enter a valid 10-digit Indian mobile number.' }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    // Check if already attempted (by email OR mobile)
    const existingByEmail = await prisma.lead.findUnique({ where: { email }, include: { attempt: true } });
    const existingByMobile = await prisma.lead.findUnique({ where: { mobile }, include: { attempt: true } });

    if (existingByEmail?.attempt || existingByMobile?.attempt) {
      return NextResponse.json({
        error: 'You have already attempted this quiz. Only one attempt is allowed per person.',
      }, { status: 409 });
    }

    // If lead exists but hasn't attempted yet (e.g. refreshed before quiz)
    if (existingByEmail || existingByMobile) {
      const lead = existingByEmail || existingByMobile;
      return NextResponse.json({ leadId: lead.id });
    }

    // Create new lead
    const lead = await prisma.lead.create({
      data: { name: name.trim(), college: college.trim(), mobile: mobile.trim(), email: email.trim().toLowerCase() },
    });

    return NextResponse.json({ leadId: lead.id });
  } catch (err) {
    console.error('submit-form error:', err);
    return NextResponse.json({ error: 'Server error. Please try again.' }, { status: 500 });
  }
}
