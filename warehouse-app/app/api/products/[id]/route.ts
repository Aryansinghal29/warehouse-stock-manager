import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Product from '@/lib/models/Product';
import { getUserId } from '@/lib/auth';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const body = await req.json() as { sku: string; name: string; quantity: number; category: string; lowStockThreshold: number };
    const { sku, name, quantity, category, lowStockThreshold } = body;

    if (!sku?.trim() || !name?.trim() || !category?.trim()) return NextResponse.json({ message: 'All fields required' }, { status: 400 });
    if (typeof quantity !== 'number' || quantity < 0) return NextResponse.json({ message: 'Quantity must be >= 0' }, { status: 400 });

    await connectDB();
    const product = await Product.findOneAndUpdate(
      { _id: id, userId },
      { sku, name, quantity, category, lowStockThreshold },
      { new: true, runValidators: true }
    );
    if (!product) return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    return NextResponse.json(product);
  } catch (err: unknown) {
    if ((err as { code?: number }).code === 11000) return NextResponse.json({ message: 'SKU already exists' }, { status: 409 });
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const { id } = await params;
  const product = await Product.findOneAndDelete({ _id: id, userId });
  if (!product) return NextResponse.json({ message: 'Product not found' }, { status: 404 });
  return NextResponse.json({ message: 'Deleted' });
}
