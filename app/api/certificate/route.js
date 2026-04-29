// app/api/certificate/route.js
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

function escapeSvgText(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function formatCertificateDate(value) {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(value);
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const leadId = searchParams.get('leadId');

    if (!leadId) {
      return NextResponse.json({ error: 'leadId required' }, { status: 400 });
    }

    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: { attempt: { include: { certificate: true } } },
    });

    if (!lead || !lead.attempt) {
      return NextResponse.json({ error: 'No quiz attempt found.' }, { status: 404 });
    }

    // Read the base SVG certificate
    const svgPath = path.join(process.cwd(), 'public', 'certificate-template.svg');
    let svgContent = fs.readFileSync(svgPath, 'utf-8');

    const escapedName = escapeSvgText(lead.name);
    const issuedAt = lead.attempt.certificate?.issuedAt || lead.attempt.completedAt || new Date();
    const escapedDate = escapeSvgText(formatCertificateDate(issuedAt));
    const nameFontSize = lead.name.length > 28 ? 86 : 104;
    
    const nameTextElement = `
    <text 
      x="1906" 
      y="850" 
      text-anchor="middle" 
      dominant-baseline="alphabetic"
      font-family="Poppins, Sora, Arial, sans-serif"
      font-size="${nameFontSize}"
      font-weight="600"
      fill="#1A1B41"
      letter-spacing="1"
    >${escapedName}</text>`;

    const dateTextElement = `
    <text
      x="1383"
      y="2185"
      text-anchor="middle"
      dominant-baseline="alphabetic"
      font-family="Poppins, Sora, Arial, sans-serif"
      font-size="58"
      font-weight="600"
      fill="#1A1B41"
      letter-spacing="0.5"
    >${escapedDate}</text>`;

    svgContent = svgContent.replace('</svg>', `${nameTextElement}${dateTextElement}</svg>`);

    // Return SVG as downloadable file
    return new NextResponse(svgContent, {
      status: 200,
      headers: {
        'Content-Type': 'image/svg+xml',
        'Content-Disposition': `attachment; filename="certificate-${lead.name.replace(/\s+/g, '-')}.svg"`,
      },
    });
  } catch (err) {
    console.error('certificate error:', err);
    return NextResponse.json({ error: 'Failed to generate certificate.' }, { status: 500 });
  }
}
