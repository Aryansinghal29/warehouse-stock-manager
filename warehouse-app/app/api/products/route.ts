import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Product from '@/lib/models/Product';
import { getUserId } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const products = await Product.find({ userId }).sort({ createdAt: -1 });
  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json() as { sku: string; name: string; quantity: number; category: string; lowStockThreshold: number };
    const { sku, name, quantity, category, lowStockThreshold } = body;

    if (!sku?.trim()) return NextResponse.json({ message: 'SKU is required' }, { status: 400 });
    if (!name?.trim()) return NextResponse.json({ message: 'Name is required' }, { status: 400 });
    if (!category?.trim()) return NextResponse.json({ message: 'Category is required' }, { status: 400 });
    if (typeof quantity !== 'number' || quantity < 0) return NextResponse.json({ message: 'Quantity must be >= 0' }, { status: 400 });
    if (typeof lowStockThreshold !== 'number' || lowStockThreshold < 0) return NextResponse.json({ message: 'Threshold must be >= 0' }, { status: 400 });

    await connectDB();
    const product = await Product.create({ sku, name, quantity, category, lowStockThreshold, userId });
    return NextResponse.json(product, { status: 201 });
  } catch (err: unknown) {
    if ((err as { code?: number }).code === 11000) return NextResponse.json({ message: 'SKU already exists' }, { status: 409 });
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
