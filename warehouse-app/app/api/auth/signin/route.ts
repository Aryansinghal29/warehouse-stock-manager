import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User, { IUser } from '@/lib/models/User';
import { signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json() as { email: string; password: string };

    if (!email || !password) return NextResponse.json({ message: 'Email and password required' }, { status: 400 });

    await connectDB();

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await (user as IUser).comparePassword(password))) {
      return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 });
    }

    const token = signToken(String(user._id));
    return NextResponse.json({ token, user });
  } catch {
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
