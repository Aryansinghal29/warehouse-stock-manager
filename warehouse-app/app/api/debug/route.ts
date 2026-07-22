import { NextResponse } from 'next/server';

export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ message: 'Not found' }, { status: 404 });
  }
  const { connectDB } = await import('@/lib/db');
  try {
    await connectDB();
    return NextResponse.json({ mongo: 'connected' });
  } catch (err: unknown) {
    return NextResponse.json({ mongo: 'failed', error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
