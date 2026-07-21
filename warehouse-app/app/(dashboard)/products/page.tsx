'use client';
import { useEffect, useState, FormEvent } from 'react';
import { apiRequest } from '@/lib/apiClient';
import { Product } from '@/types';
import Badge from '@/components/Badge';

type ProductForm = Omit<Product, '_id' | 'createdAt'>;
const empty: ProductForm = { sku: '', name: '', quantity: 0, category: '', lowStockThreshold: 10 };

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<ProductForm>(empty);
  const [editId, setEditId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    apiRequest<Product[]>('/api/products').then(setProducts).finally(() => setLoading(false));
  }, []);

  const openAdd = () => { setForm(empty); setEditId(null); setError(''); setShowModal(true); };
  const openEdit = (p: Product) => {
    setForm({ sku: p.sku, name: p.name, quantity: p.quantity, category: p.category, lowStockThreshold: p.lowStockThreshold });
    setEditId(p._id); setError(''); setShowModal(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true); setError('');
    try {
      if (editId) {
        const updated = await apiRequest<Product>(`/api/products/${editId}`, { method: 'PUT', body: JSON.stringify(form) });
        setProducts(ps => ps.map(p => p._id === editId ? updated : p));
      } else {
        const created = await apiRequest<Product>('/api/products', { method: 'POST', body: JSON.stringify(form) });
        setProducts(ps => [created, ...ps]);
      }
      setShowModal(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error saving product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    await apiRequest(`/api/products/${id}`, { method: 'DELETE' });
    setProducts(ps => ps.filter(p => p._id !== id));
  };

  const stockStatus = (p: Product) =>
    p.quantity === 0 ? 'Out of Stock' : p.quantity <= p.lowStockThreshold ? 'Low Stock' : 'In Stock';

  if (loading) return <p className="text-slate-400">Loading...</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-2xl font-bold text-slate-800">Products</h2>
        <button onClick={openAdd} className="btn-primary">+ Add Product</button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 w-full max-w-md flex flex-col gap-3 shadow-xl">
            <h3 className="text-lg font-bold text-slate-800">{editId ? 'Edit Product' : 'Add Product'}</h3>
            {error && <p className="text-red-500 text-sm bg-red-50 p-2 rounded">{error}</p>}
            {([
              { label: 'SKU', key: 'sku', type: 'text' },
              { label: 'Name', key: 'name', type: 'text' },
              { label: 'Category', key: 'category', type: 'text' },
              { label: 'Quantity', key: 'quantity', type: 'number' },
              { label: 'Low Stock Threshold', key: 'lowStockThreshold', type: 'number' },
            ] as const).map(({ label, key, type }) => (
              <label key={key} className="flex flex-col gap-1 text-sm font-medium text-slate-600">
                {label}
                <input className="input" type={type} min={type === 'number' ? 0 : undefined}
                  value={form[key]}
                  onChange={e => setForm(f => ({ ...f, [key]: type === 'number' ? Number(e.target.value) : e.target.value }))}
                  required />
              </label>
            ))}
            <div className="flex justify-end gap-2 mt-1">
              <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary" disabled={submitting}>{submitting ? 'Saving...' : 'Save'}</button>
            </div>
          </form>
        </div>
      )}

      {products.length === 0 ? (
        <p className="text-slate-400 italic">No products yet.</p>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
              <tr>
                {['SKU', 'Name', 'Category', 'Qty', 'Threshold', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p._id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-mono text-xs">{p.sku}</td>
                  <td className="px-4 py-3">{p.name}</td>
                  <td className="px-4 py-3">{p.category}</td>
                  <td className="px-4 py-3">{p.quantity}</td>
                  <td className="px-4 py-3">{p.lowStockThreshold}</td>
                  <td className="px-4 py-3"><Badge label={stockStatus(p) as 'In Stock' | 'Low Stock' | 'Out of Stock'} /></td>
                  <td className="px-4 py-3 flex gap-2">
                    <button onClick={() => openEdit(p)} className="btn-secondary text-xs">Edit</button>
                    <button onClick={() => handleDelete(p._id)} className="text-xs px-2 py-1 bg-red-50 text-red-500 rounded hover:bg-red-100">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
