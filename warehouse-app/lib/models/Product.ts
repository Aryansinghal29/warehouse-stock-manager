import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
  sku: string;
  name: string;
  quantity: number;
  category: string;
  lowStockThreshold: number;
  userId: mongoose.Types.ObjectId;
}

const productSchema = new Schema<IProduct>({
  sku: { type: String, required: true, trim: true, uppercase: true },
  name: { type: String, required: true, trim: true },
  quantity: { type: Number, required: true, min: 0, default: 0 },
  category: { type: String, required: true, trim: true },
  lowStockThreshold: { type: Number, required: true, min: 0, default: 10 },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

productSchema.index({ sku: 1, userId: 1 }, { unique: true });

export default mongoose.models.Product ?? mongoose.model<IProduct>('Product', productSchema);
