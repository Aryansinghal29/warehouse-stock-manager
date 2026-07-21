import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/lib/models/User';
import { signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json() as { name: string; email: string; password: string };

    if (!name?.trim()) return NextResponse.json({ message: 'Name is required' }, { status: 400 });
    if (!email || !/\S+@\S+\.\S+/.test(email)) return NextResponse.json({ message: 'Valid email required' }, { status: 400 });
    if (!password || password.length < 6) return NextResponse.json({ message: 'Password must be at least 6 characters' }, { status: 400 });

    await connectDB();

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return NextResponse.json({ message: 'Email already in use' }, { status: 409 });

    const user = await User.create({ name, email, password });
    const token = signToken(String(user._id));

    return NextResponse.json({ token, user }, { status: 201 });
  } catch {
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
