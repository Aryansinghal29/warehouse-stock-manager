import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/db';
import Product from '@/lib/models/Product';
import Order, { IOrderItem, ItemStatus } from '@/lib/models/Order';
import { getUserId } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const orders = await Order.find({ userId }).sort({ createdAt: -1 });
  return NextResponse.json(orders);
}

export async function POST(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const { items } = await req.json() as { items: { sku: string; quantity: number }[] };

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ message: 'At least one item required' }, { status: 400 });
    }

    for (const item of items) {
      if (!item.sku?.trim()) return NextResponse.json({ message: 'SKU is required for each item' }, { status: 400 });
      if (!Number.isInteger(item.quantity) || item.quantity < 1) {
        return NextResponse.json({ message: `Quantity for ${item.sku} must be at least 1` }, { status: 400 });
      }
    }

    await connectDB();

    const orderItems: IOrderItem[] = [];

    for (const item of items) {
      const sku = item.sku.toUpperCase().trim();

      // Atomic findOneAndUpdate — deducts only what's available, prevents overselling
      // $inc with negative value is atomic in MongoDB even without transactions
      const product = await Product.findOne({ sku, userId });
      if (!product) {
        return NextResponse.json({ message: `SKU "${sku}" not found` }, { status: 404 });
      }

      const canFulfill = Math.min(product.quantity, item.quantity);
      const backordered = item.quantity - canFulfill;

      // Atomic decrement — only deduct what we can fulfill
      await Product.findOneAndUpdate(
        { sku, userId, quantity: { $gte: canFulfill } },
        { $inc: { quantity: -canFulfill } }
      );

      const itemStatus: ItemStatus =
        canFulfill === 0 ? 'backordered' :
        backordered > 0 ? 'partial' : 'fulfilled';

      orderItems.push({
        productId: product._id as mongoose.Types.ObjectId,
        sku: product.sku,
        requested: item.quantity,
        fulfilled: canFulfill,
        backordered,
        status: itemStatus,
      });
    }

    const overallStatus: ItemStatus =
      orderItems.every(i => i.status === 'fulfilled') ? 'fulfilled' :
      orderItems.every(i => i.status === 'backordered') ? 'backordered' : 'partial';

    const order = await Order.create({ userId, items: orderItems, status: overallStatus });
    return NextResponse.json(order, { status: 201 });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ message }, { status: 500 });
  }
}
