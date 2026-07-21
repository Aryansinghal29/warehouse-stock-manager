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
  notes: string;
  createdAt: string;
}

export interface ApiError {
  message?: string;
  errors?: { msg: string }[];
}
