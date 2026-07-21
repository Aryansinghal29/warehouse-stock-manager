import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import mongoose from 'mongoose';
import { authenticate, AuthRequest } from '../middleware/auth';
import Product from '../models/Product';
import Order, { IOrderItem, OrderStatus } from '../models/Order';

const router = Router();
router.use(authenticate);

router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const orders = await Order.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/',
  body('items').isArray({ min: 1 }).withMessage('At least one item required'),
  body('items.*.sku').trim().notEmpty().withMessage('SKU required for each item'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) { res.status(400).json({ errors: errors.array() }); return; }

    const requestedItems = req.body.items as { sku: string; quantity: number }[];
    const session = await mongoose.startSession();

    try {
      let createdOrder: InstanceType<typeof Order> | null = null;

      await session.withTransaction(async () => {
        const orderItems: IOrderItem[] = [];

        for (const item of requestedItems) {
          const product = await Product.findOne(
            { sku: item.sku.toUpperCase(), userId: req.userId },
            null,
            { session }
          );

          if (!product) throw new Error(`SKU ${item.sku} not found`);

          const canFulfill = Math.min(product.quantity, item.quantity);
          const backordered = item.quantity - canFulfill;

          // Atomic decrement — only deduct what we can fulfill
          await Product.findByIdAndUpdate(
            product._id,
            { $inc: { quantity: -canFulfill } },
            { session }
          );

          const itemStatus: IOrderItem['status'] =
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

        const overallStatus: OrderStatus =
          orderItems.every(i => i.status === 'fulfilled') ? 'fulfilled' :
          orderItems.every(i => i.status === 'backordered') ? 'backordered' : 'partial';

        const [order] = await Order.create([{
          userId: req.userId,
          items: orderItems,
          status: overallStatus,
        }], { session });

        createdOrder = order;
      });

      res.status(201).json(createdOrder);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Server error';
      res.status(400).json({ message });
    } finally {
      session.endSession();
    }
  }
);

export default router;
