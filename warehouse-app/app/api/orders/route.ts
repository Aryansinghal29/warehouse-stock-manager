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

  const { items } = await req.json() as { items: { sku: string; quantity: number }[] };
  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ message: 'At least one item required' }, { status: 400 });
  }

  await connectDB();
  const session = await mongoose.startSession();

  try {
    let createdOrder: InstanceType<typeof Order> | null = null;

    await session.withTransaction(async () => {
      const orderItems: IOrderItem[] = [];

      for (const item of items) {
        if (!item.sku || item.quantity < 1) throw new Error('Invalid item: SKU and quantity >= 1 required');

        const product = await Product.findOne({ sku: item.sku.toUpperCase(), userId }, null, { session });
        if (!product) throw new Error(`SKU ${item.sku} not found`);

        const canFulfill = Math.min(product.quantity, item.quantity);
        const backordered = item.quantity - canFulfill;

        await Product.findByIdAndUpdate(product._id, { $inc: { quantity: -canFulfill } }, { session });

        const itemStatus: ItemStatus = canFulfill === 0 ? 'backordered' : backordered > 0 ? 'partial' : 'fulfilled';

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

      const [order] = await Order.create([{ userId, items: orderItems, status: overallStatus }], { session });
      createdOrder = order;
    });

    return NextResponse.json(createdOrder, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ message }, { status: 400 });
  } finally {
    session.endSession();
  }
}
