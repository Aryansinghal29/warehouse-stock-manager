import mongoose, { Document, Schema } from 'mongoose';

export type ItemStatus = 'fulfilled' | 'backordered' | 'partial';

export interface IOrderItem {
  productId: mongoose.Types.ObjectId;
  sku: string;
  requested: number;
  fulfilled: number;
  backordered: number;
  status: ItemStatus;
}

export interface IOrder extends Document {
  userId: mongoose.Types.ObjectId;
  items: IOrderItem[];
  status: ItemStatus;
  createdAt: Date;
}

const itemSchema = new Schema<IOrderItem>({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  sku: { type: String, required: true },
  requested: { type: Number, required: true },
  fulfilled: { type: Number, required: true },
  backordered: { type: Number, required: true },
  status: { type: String, enum: ['fulfilled', 'backordered', 'partial'], required: true },
}, { _id: false });

const orderSchema = new Schema<IOrder>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  items: { type: [itemSchema], required: true },
  status: { type: String, enum: ['fulfilled', 'backordered', 'partial'], required: true },
}, { timestamps: true });

export default mongoose.models.Order ?? mongoose.model<IOrder>('Order', orderSchema);
