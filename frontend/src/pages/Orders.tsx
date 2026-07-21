import { useEffect, useState, FormEvent } from 'react';
import api from '../api/client';
import { Order, Product, ApiError } from '../types';
import axios from 'axios';
import toast from 'react-hot-toast';

interface OrderLineInput { sku: string; quantity: number }

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [lines, setLines] = useState<OrderLineInput[]>([{ sku: '', quantity: 1 }]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get<Order[]>('/orders'),
      api.get<Product[]>('/products'),
    ]).then(([o, p]) => {
      setOrders(o.data);
      setProducts(p.data);
    }).finally(() => setLoading(false));
  }, []);

  const addLine = () => setLines(l => [...l, { sku: '', quantity: 1 }]);
  const removeLine = (i: number) => setLines(l => l.filter((_, idx) => idx !== i));
  const updateLine = (i: number, field: keyof OrderLineInput, value: string | number) =>
    setLines(l => l.map((line, idx) => idx === i ? { ...line, [field]: value } : line));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await api.post<Order>('/orders', { items: lines });
      setOrders(o => [data, ...o]);
      // Refresh products to reflect updated quantities
      const { data: updated } = await api.get<Product[]>('/products');
      setProducts(updated);
      toast.success(`Order placed — status: ${data.status}`);
      setShowForm(false);
      setLines([{ sku: '', quantity: 1 }]);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const d = err.response?.data as ApiError;
        toast.error(d?.errors?.[0]?.msg || d?.message || 'Failed to place order');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const statusBadge = (status: Order['status']) => {
    const map = {
      fulfilled: styles.badgeGreen,
      backordered: styles.badgeRed,
      partial: styles.badgeYellow,
    };
    return <span style={map[status]}>{status}</span>;
  };

  if (loading) return <div style={styles.loading}>Loading...</div>;

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h2 style={styles.heading}>Orders</h2>
        <button style={styles.addBtn} onClick={() => setShowForm(true)}>+ Place Order</button>
      </div>

      {showForm && (
        <div style={styles.overlay}>
          <form onSubmit={handleSubmit} style={styles.modal}>
            <h3 style={{ margin: 0, marginBottom: '1rem' }}>Place Order</h3>
            {lines.map((line, i) => (
              <div key={i} style={styles.lineRow}>
                <select
                  style={styles.select}
                  value={line.sku}
                  onChange={e => updateLine(i, 'sku', e.target.value)}
                  required
                >
                  <option value="">Select SKU</option>
                  {products.map(p => (
                    <option key={p._id} value={p.sku}>{p.sku} — {p.name} (stock: {p.quantity})</option>
                  ))}
                </select>
                <input
                  style={styles.qtyInput}
                  type="number"
                  min={1}
                  value={line.quantity}
                  onChange={e => updateLine(i, 'quantity', Number(e.target.value))}
                  required
                />
                {lines.length > 1 && (
                  <button type="button" style={styles.removeBtn} onClick={() => removeLine(i)}>✕</button>
                )}
              </div>
            ))}
            <button type="button" style={styles.addLineBtn} onClick={addLine}>+ Add Item</button>
            <div style={styles.modalActions}>
              <button type="button" style={styles.cancelBtn} onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" style={styles.saveBtn} disabled={submitting}>
                {submitting ? 'Placing...' : 'Place Order'}
              </button>
            </div>
          </form>
        </div>
      )}

      {orders.length === 0 ? (
        <p style={styles.empty}>No orders yet.</p>
      ) : (
        <div style={styles.orderList}>
          {orders.map(order => (
            <div key={order._id} style={styles.orderCard}>
              <div style={styles.orderHeader}>
                <span style={styles.orderId}>#{order._id.slice(-8)}</span>
                {statusBadge(order.status)}
                <span style={styles.orderDate}>{new Date(order.createdAt).toLocaleString()}</span>
              </div>
              <table style={styles.itemTable}>
                <thead>
                  <tr>
                    {['SKU', 'Requested', 'Fulfilled', 'Backordered', 'Status'].map(h => (
                      <th key={h} style={styles.ith}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, i) => (
                    <tr key={i}>
                      <td style={styles.itd}><code>{item.sku}</code></td>
                      <td style={styles.itd}>{item.requested}</td>
                      <td style={styles.itd}>{item.fulfilled}</td>
                      <td style={styles.itd}>{item.backordered}</td>
                      <td style={styles.itd}>{statusBadge(item.status)}</td>
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

const styles: Record<string, React.CSSProperties> = {
  page: { padding: '1.5rem', maxWidth: '1000px', margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' },
  heading: { color: '#1e293b', margin: 0 },
  addBtn: { background: '#3b82f6', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 },
  loading: { padding: '2rem', textAlign: 'center', color: '#64748b' },
  empty: { color: '#64748b', fontStyle: 'italic' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
  modal: { background: '#fff', padding: '1.75rem', borderRadius: '8px', width: '100%', maxWidth: '520px', display: 'flex', flexDirection: 'column', gap: '0.6rem', maxHeight: '90vh', overflowY: 'auto' },
  lineRow: { display: 'flex', gap: '0.5rem', alignItems: 'center' },
  select: { flex: 1, padding: '0.55rem 0.75rem', border: '1px solid #e2e8f0', borderRadius: '4px', fontSize: '0.9rem' },
  qtyInput: { width: '80px', padding: '0.55rem 0.5rem', border: '1px solid #e2e8f0', borderRadius: '4px', fontSize: '0.9rem' },
  removeBtn: { background: '#fee2e2', color: '#ef4444', border: 'none', padding: '0.35rem 0.5rem', borderRadius: '4px', cursor: 'pointer' },
  addLineBtn: { background: '#f1f5f9', border: 'none', padding: '0.4rem 0.75rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', alignSelf: 'flex-start' },
  modalActions: { display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' },
  cancelBtn: { background: '#f1f5f9', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' },
  saveBtn: { background: '#3b82f6', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 },
  orderList: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  orderCard: { background: '#fff', borderRadius: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'hidden' },
  orderHeader: { display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' },
  orderId: { fontFamily: 'monospace', color: '#475569', fontSize: '0.85rem' },
  orderDate: { marginLeft: 'auto', color: '#94a3b8', fontSize: '0.8rem' },
  itemTable: { width: '100%', borderCollapse: 'collapse' },
  ith: { padding: '0.5rem 1rem', textAlign: 'left', fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' },
  itd: { padding: '0.5rem 1rem', borderTop: '1px solid #f1f5f9', fontSize: '0.85rem' },
  badgeGreen: { background: '#dcfce7', color: '#16a34a', padding: '0.2rem 0.5rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600 },
  badgeYellow: { background: '#fef9c3', color: '#ca8a04', padding: '0.2rem 0.5rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600 },
  badgeRed: { background: '#fee2e2', color: '#ef4444', padding: '0.2rem 0.5rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600 },
};
