import { useEffect, useState, FormEvent } from 'react';
import api from '../api/client';
import { Product, ApiError } from '../types';
import axios from 'axios';
import toast from 'react-hot-toast';

type ProductForm = Omit<Product, '_id' | 'createdAt'>;
const emptyForm: ProductForm = { sku: '', name: '', quantity: 0, category: '', lowStockThreshold: 10 };

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchProducts = () =>
    api.get<Product[]>('/products').then(r => setProducts(r.data)).finally(() => setLoading(false));

  useEffect(() => { fetchProducts(); }, []);

  const openAdd = () => { setForm(emptyForm); setEditId(null); setShowForm(true); };
  const openEdit = (p: Product) => {
    setForm({ sku: p.sku, name: p.name, quantity: p.quantity, category: p.category, lowStockThreshold: p.lowStockThreshold });
    setEditId(p._id);
    setShowForm(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editId) {
        const { data } = await api.put<Product>(`/products/${editId}`, form);
        setProducts(ps => ps.map(p => p._id === editId ? data : p));
        toast.success('Product updated');
      } else {
        const { data } = await api.post<Product>('/products', form);
        setProducts(ps => [data, ...ps]);
        toast.success('Product added');
      }
      setShowForm(false);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const d = err.response?.data as ApiError;
        toast.error(d?.errors?.[0]?.msg || d?.message || 'Error saving product');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      setProducts(ps => ps.filter(p => p._id !== id));
      toast.success('Product deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  if (loading) return <div style={styles.loading}>Loading...</div>;

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h2 style={styles.heading}>Products</h2>
        <button style={styles.addBtn} onClick={openAdd}>+ Add Product</button>
      </div>

      {showForm && (
        <div style={styles.overlay}>
          <form onSubmit={handleSubmit} style={styles.modal}>
            <h3 style={{ margin: 0, marginBottom: '1rem' }}>{editId ? 'Edit Product' : 'Add Product'}</h3>
            {[
              { label: 'SKU', key: 'sku', type: 'text' },
              { label: 'Name', key: 'name', type: 'text' },
              { label: 'Category', key: 'category', type: 'text' },
              { label: 'Quantity', key: 'quantity', type: 'number' },
              { label: 'Low Stock Threshold', key: 'lowStockThreshold', type: 'number' },
            ].map(({ label, key, type }) => (
              <label key={key} style={styles.label}>
                {label}
                <input
                  style={styles.input}
                  type={type}
                  min={type === 'number' ? 0 : undefined}
                  value={form[key as keyof ProductForm]}
                  onChange={e => setForm(f => ({ ...f, [key]: type === 'number' ? Number(e.target.value) : e.target.value }))}
                  required
                />
              </label>
            ))}
            <div style={styles.modalActions}>
              <button type="button" style={styles.cancelBtn} onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" style={styles.saveBtn} disabled={submitting}>
                {submitting ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      )}

      {products.length === 0 ? (
        <p style={styles.empty}>No products yet. Add one to get started.</p>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              {['SKU', 'Name', 'Category', 'Quantity', 'Threshold', 'Status', 'Actions'].map(h => (
                <th key={h} style={styles.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p._id}>
                <td style={styles.td}><code>{p.sku}</code></td>
                <td style={styles.td}>{p.name}</td>
                <td style={styles.td}>{p.category}</td>
                <td style={styles.td}>{p.quantity}</td>
                <td style={styles.td}>{p.lowStockThreshold}</td>
                <td style={styles.td}>
                  {p.quantity === 0
                    ? <span style={styles.badgeRed}>Out of Stock</span>
                    : p.quantity <= p.lowStockThreshold
                    ? <span style={styles.badgeYellow}>Low Stock</span>
                    : <span style={styles.badgeGreen}>In Stock</span>}
                </td>
                <td style={styles.td}>
                  <button style={styles.editBtn} onClick={() => openEdit(p)}>Edit</button>
                  <button style={styles.deleteBtn} onClick={() => handleDelete(p._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { padding: '1.5rem', maxWidth: '1100px', margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' },
  heading: { color: '#1e293b', margin: 0 },
  addBtn: { background: '#3b82f6', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 },
  table: { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
  th: { background: '#f1f5f9', padding: '0.65rem 1rem', textAlign: 'left', fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' },
  td: { padding: '0.65rem 1rem', borderTop: '1px solid #f1f5f9', fontSize: '0.9rem' },
  editBtn: { background: '#e2e8f0', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: 'pointer', marginRight: '0.4rem', fontSize: '0.8rem' },
  deleteBtn: { background: '#fee2e2', color: '#ef4444', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' },
  badgeGreen: { background: '#dcfce7', color: '#16a34a', padding: '0.2rem 0.5rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600 },
  badgeYellow: { background: '#fef9c3', color: '#ca8a04', padding: '0.2rem 0.5rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600 },
  badgeRed: { background: '#fee2e2', color: '#ef4444', padding: '0.2rem 0.5rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600 },
  empty: { color: '#64748b', fontStyle: 'italic' },
  loading: { padding: '2rem', textAlign: 'center', color: '#64748b' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
  modal: { background: '#fff', padding: '1.75rem', borderRadius: '8px', width: '100%', maxWidth: '420px', display: 'flex', flexDirection: 'column', gap: '0.6rem' },
  label: { display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.85rem', color: '#475569', fontWeight: 500 },
  input: { padding: '0.55rem 0.75rem', border: '1px solid #e2e8f0', borderRadius: '4px', fontSize: '0.95rem' },
  modalActions: { display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' },
  cancelBtn: { background: '#f1f5f9', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' },
  saveBtn: { background: '#3b82f6', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 },
};
