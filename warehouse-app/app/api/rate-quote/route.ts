import { NextRequest, NextResponse } from 'next/server';
import { getUserId } from '@/lib/auth';
import { computeRateQuote, ShipmentInput } from '@/lib/rateEngine';

export async function POST(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const { originPincode, destinationPincode, items } = await req.json() as {
      originPincode: string;
      destinationPincode: string;
      items: ShipmentInput[];
    };

    if (!originPincode?.trim()) return NextResponse.json({ message: 'Origin pincode required' }, { status: 400 });
    if (!destinationPincode?.trim()) return NextResponse.json({ message: 'Destination pincode required' }, { status: 400 });
    if (!Array.isArray(items) || items.length === 0) return NextResponse.json({ message: 'At least one item required' }, { status: 400 });

    for (const item of items) {
      if (!item.sku?.trim()) return NextResponse.json({ message: 'SKU required for each item' }, { status: 400 });
      if (item.quantity < 1) return NextResponse.json({ message: 'Quantity must be >= 1' }, { status: 400 });
      if (item.weightKg <= 0) return NextResponse.json({ message: 'Weight must be > 0' }, { status: 400 });
      if (item.lengthCm <= 0 || item.widthCm <= 0 || item.heightCm <= 0) {
        return NextResponse.json({ message: 'Dimensions must be > 0' }, { status: 400 });
      }
    }

    const quote = computeRateQuote(originPincode.trim(), destinationPincode.trim(), items);
    return NextResponse.json(quote);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ message }, { status: 400 });
  }
}
