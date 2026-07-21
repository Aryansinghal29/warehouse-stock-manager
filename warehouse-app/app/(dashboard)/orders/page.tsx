'use client';
import { useEffect, useState, FormEvent } from 'react';
import { apiRequest } from '@/lib/apiClient';
import { Order, Product } from '@/types';
import Badge from '@/components/Badge';

interface LineInput { sku: string; quantity: number }

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [lines, setLines] = useState<LineInput[]>([{ sku: '', quantity: 1 }]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      apiRequest<Order[]>('/api/orders'),
      apiRequest<Product[]>('/api/products'),
    ]).then(([o, p]) => { setOrders(o); setProducts(p); }).finally(() => setLoading(false));
  }, []);

  const updateLine = (i: number, field: keyof LineInput, val: string | number) =>
    setLines(ls => ls.map((l, idx) => idx === i ? { ...l, [field]: val } : l));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true); setError('');
    try {
      const order = await apiRequest<Order>('/api/orders', { method: 'POST', body: JSON.stringify({ items: lines }) });
      setOrders(o => [order, ...o]);
      const updated = await apiRequest<Product[]>('/api/products');
      setProducts(updated);
      setShowModal(false);
      setLines([{ sku: '', quantity: 1 }]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to place order');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="text-slate-400">Loading...</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-2xl font-bold text-slate-800">Orders</h2>
        <button onClick={() => { setError(''); setShowModal(true); }} className="btn-primary">+ Place Order</button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 w-full max-w-lg flex flex-col gap-3 shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-800">Place Order</h3>
            {error && <p className="text-red-500 text-sm bg-red-50 p-2 rounded">{error}</p>}
            {lines.map((line, i) => (
              <div key={i} className="flex gap-2 items-center">
                <select className="input flex-1" value={line.sku} onChange={e => updateLine(i, 'sku', e.target.value)} required>
                  <option value="">Select SKU</option>
                  {products.map(p => (
                    <option key={p._id} value={p.sku}>{p.sku} — {p.name} (stock: {p.quantity})</option>
                  ))}
                </select>
                <input className="input w-20" type="number" min={1} value={line.quantity}
                  onChange={e => updateLine(i, 'quantity', Number(e.target.value))} required />
                {lines.length > 1 && (
                  <button type="button" onClick={() => setLines(ls => ls.filter((_, idx) => idx !== i))}
                    className="text-red-400 hover:text-red-600 text-lg leading-none">✕</button>
                )}
              </div>
            ))}
            <button type="button" onClick={() => setLines(ls => [...ls, { sku: '', quantity: 1 }])}
              className="btn-secondary self-start text-sm">+ Add Item</button>
            <div className="flex justify-end gap-2 mt-1">
              <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary" disabled={submitting}>{submitting ? 'Placing...' : 'Place Order'}</button>
            </div>
          </form>
        </div>
      )}

      {orders.length === 0 ? (
        <p className="text-slate-400 italic">No orders yet.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map(order => (
            <div key={order._id} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 border-b border-slate-100">
                <span className="font-mono text-xs text-slate-500">#{order._id.slice(-8)}</span>
                <Badge label={order.status} />
                <span className="ml-auto text-xs text-slate-400">{new Date(order.createdAt).toLocaleString()}</span>
              </div>
              <table className="w-full text-sm">
                <thead className="text-slate-400 uppercase text-xs">
                  <tr>
                    {['SKU', 'Requested', 'Fulfilled', 'Backordered', 'Status'].map(h => (
                      <th key={h} className="px-4 py-2 text-left">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, i) => (
                    <tr key={i} className="border-t border-slate-100">
                      <td className="px-4 py-2 font-mono text-xs">{item.sku}</td>
                      <td className="px-4 py-2">{item.requested}</td>
                      <td className="px-4 py-2">{item.fulfilled}</td>
                      <td className="px-4 py-2">{item.backordered}</td>
                      <td className="px-4 py-2"><Badge label={item.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
