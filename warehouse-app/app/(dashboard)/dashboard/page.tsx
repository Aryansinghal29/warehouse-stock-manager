'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiRequest } from '@/lib/apiClient';
import { Product } from '@/types';
import Badge from '@/components/Badge';

export default function DashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest<Product[]>('/api/products').then(setProducts).finally(() => setLoading(false));
  }, []);

  const lowStock = products.filter(p => p.quantity <= p.lowStockThreshold);

  if (loading) return <p className="text-slate-400">Loading...</p>;

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 mb-5">Dashboard</h2>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Products', value: products.length, color: 'border-blue-500' },
          { label: 'Total Units', value: products.reduce((s, p) => s + p.quantity, 0), color: 'border-emerald-500' },
          { label: 'Low Stock Alerts', value: lowStock.length, color: 'border-red-500' },
        ].map(({ label, value, color }) => (
          <div key={label} className={`bg-white rounded-lg shadow-sm p-5 border-t-4 ${color}`}>
            <div className="text-3xl font-bold text-slate-700">{value}</div>
            <div className="text-sm text-slate-500 mt-1">{label}</div>
          </div>
        ))}
      </div>

      <h3 className="text-lg font-semibold text-slate-700 mb-3">⚠️ Low Stock Items ({lowStock.length})</h3>
      {lowStock.length === 0 ? (
        <p className="text-slate-400 italic">All items are sufficiently stocked.</p>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
              <tr>
                {['SKU', 'Name', 'Category', 'Qty', 'Threshold', 'Status'].map(h => (
                  <th key={h} className="px-4 py-3 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lowStock.map(p => (
                <tr key={p._id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-mono text-xs">{p.sku}</td>
                  <td className="px-4 py-3">{p.name}</td>
                  <td className="px-4 py-3">{p.category}</td>
                  <td className="px-4 py-3 font-semibold">{p.quantity}</td>
                  <td className="px-4 py-3">{p.lowStockThreshold}</td>
                  <td className="px-4 py-3">
                    <Badge label={p.quantity === 0 ? 'Out of Stock' : 'Low Stock'} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex gap-4 mt-6">
        <Link href="/products" className="text-blue-500 hover:underline text-sm font-medium">Manage Products →</Link>
        <Link href="/orders" className="text-blue-500 hover:underline text-sm font-medium">View Orders →</Link>
      </div>
    </div>
  );
}
