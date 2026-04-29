// app/api/admin/login/route.js
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'change-this-secret-in-production';

export async function POST(req) {
  try {
    const { username, password } = await req.json();
    const admin = await prisma.adminUser.findUnique({ where: { username } });
    if (!admin || !(await bcrypt.compare(password, admin.password))) {
      return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 });
    }
    const token = jwt.sign({ id: admin.id, username: admin.username }, JWT_SECRET, { expiresIn: '8h' });
    return NextResponse.json({ token });
  } catch (err) {
    console.error('admin login error:', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
