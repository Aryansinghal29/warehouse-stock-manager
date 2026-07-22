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

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div>
      <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-5">Dashboard</h2>

      {/* Stat cards — 1 col mobile, 3 col desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-8">
        {[
          { label: 'Total Products', value: products.length, color: 'border-blue-500', bg: 'bg-blue-50', text: 'text-blue-600' },
          { label: 'Total Units', value: products.reduce((s, p) => s + p.quantity, 0), color: 'border-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-600' },
          { label: 'Low Stock Alerts', value: lowStock.length, color: 'border-red-500', bg: 'bg-red-50', text: 'text-red-600' },
        ].map(({ label, value, color, bg, text }) => (
          <div key={label} className={`bg-white rounded-xl shadow-sm p-4 sm:p-5 border-t-4 ${color} flex items-center sm:block gap-4`}>
            <div className={`w-10 h-10 sm:w-auto sm:h-auto rounded-lg ${bg} flex items-center justify-center sm:hidden`}>
              <span className={`text-lg font-bold ${text}`}>{value}</span>
            </div>
            <div>
              <div className={`hidden sm:block text-3xl font-bold ${text} mb-1`}>{value}</div>
              <div className="text-sm text-slate-500">{label}</div>
            </div>
          </div>
        ))}
      </div>

      <h3 className="text-base sm:text-lg font-semibold text-slate-700 mb-3">⚠️ Low Stock Items ({lowStock.length})</h3>
      {lowStock.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-6 text-center">
          <p className="text-slate-400 italic">All items are sufficiently stocked. ✅</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Mobile cards */}
          <div className="sm:hidden divide-y divide-slate-100">
            {lowStock.map(p => (
              <div key={p._id} className="p-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-mono text-xs text-slate-500">{p.sku}</div>
                  <div className="font-medium text-slate-800 truncate">{p.name}</div>
                  <div className="text-xs text-slate-400">{p.category}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-bold text-slate-700">{p.quantity} / {p.lowStockThreshold}</div>
                  <Badge label={p.quantity === 0 ? 'Out of Stock' : 'Low Stock'} />
                </div>
              </div>
            ))}
          </div>
          {/* Desktop table */}
          <div className="hidden sm:block overflow-x-auto">
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
                  <tr key={p._id} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono text-xs">{p.sku}</td>
                    <td className="px-4 py-3">{p.name}</td>
                    <td className="px-4 py-3">{p.category}</td>
                    <td className="px-4 py-3 font-semibold">{p.quantity}</td>
                    <td className="px-4 py-3">{p.lowStockThreshold}</td>
                    <td className="px-4 py-3"><Badge label={p.quantity === 0 ? 'Out of Stock' : 'Low Stock'} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3 mt-6">
        <Link href="/products" className="flex-1 sm:flex-none text-center bg-white border border-slate-200 hover:border-blue-400 text-blue-500 hover:text-blue-600 text-sm font-medium px-4 py-2.5 rounded-lg transition-colors">
          Manage Products →
        </Link>
        <Link href="/orders" className="flex-1 sm:flex-none text-center bg-white border border-slate-200 hover:border-blue-400 text-blue-500 hover:text-blue-600 text-sm font-medium px-4 py-2.5 rounded-lg transition-colors">
          View Orders →
        </Link>
      </div>
    </div>
  );
}
