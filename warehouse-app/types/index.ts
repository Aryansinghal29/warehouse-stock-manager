export interface User {
  _id: string;
  name: string;
  email: string;
}

export interface Product {
  _id: string;
  sku: string;
  name: string;
  quantity: number;
  category: string;
  lowStockThreshold: number;
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  sku: string;
  requested: number;
  fulfilled: number;
  backordered: number;
  status: 'fulfilled' | 'backordered' | 'partial';
}

export interface Order {
  _id: string;
  items: OrderItem[];
  status: 'fulfilled' | 'backordered' | 'partial';
  createdAt: string;
}

export interface ApiError {
  message?: string;
}

// Tier 3 — Rate & Routing Engine
export interface ShipmentItem {
  sku: string;
  quantity: number;
  weightKg: number;       // actual weight per unit
  lengthCm: number;
  widthCm: number;
  heightCm: number;
}

export interface VehicleLoad {
  vehicleType: string;
  capacityKg: number;
  items: ShipmentItem[];
  totalChargeableKg: number;
  cost: number;
}

export interface RateQuote {
  originPincode: string;
  destinationPincode: string;
  originZone: string;
  destinationZone: string;
  ratePerKg: number;
  vehicles: VehicleLoad[];
  totalCost: number;
  justification: string;
}
