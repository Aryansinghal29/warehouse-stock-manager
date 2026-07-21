import mongoose, { Document, Schema } from 'mongoose';

export type OrderItemStatus = 'fulfilled' | 'backordered' | 'partial';
export type OrderStatus = 'fulfilled' | 'backordered' | 'partial';

export interface IOrderItem {
  productId: mongoose.Types.ObjectId;
  sku: string;
  requested: number;
  fulfilled: number;
  backordered: number;
  status: OrderItemStatus;
}

export interface IOrder extends Document {
  userId: mongoose.Types.ObjectId;
  items: IOrderItem[];
  status: OrderStatus;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  sku: { type: String, required: true },
  requested: { type: Number, required: true, min: 1 },
  fulfilled: { type: Number, required: true, min: 0 },
  backordered: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ['fulfilled', 'backordered', 'partial'], required: true },
}, { _id: false });

const orderSchema = new Schema<IOrder>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  items: { type: [orderItemSchema], required: true },
  status: { type: String, enum: ['fulfilled', 'backordered', 'partial'], required: true },
  notes: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.model<IOrder>('Order', orderSchema);
