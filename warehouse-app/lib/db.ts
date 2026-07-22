import mongoose from 'mongoose';

const cached = global as typeof global & {
  mongoose?: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
};

if (!cached.mongoose) cached.mongoose = { conn: null, promise: null };

export async function connectDB() {
  if (cached.mongoose!.conn) return cached.mongoose!.conn;

  const MONGO_URI = (process.env.MONGO_URI || '').trim();
  if (!MONGO_URI) throw new Error('MONGO_URI is not defined');

  if (!cached.mongoose!.promise) {
    cached.mongoose!.promise = mongoose.connect(MONGO_URI, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000,
    });
  }

  cached.mongoose!.conn = await cached.mongoose!.promise;
  return cached.mongoose!.conn;
}
