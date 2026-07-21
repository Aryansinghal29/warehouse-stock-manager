import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { Product } from '../types';

export default function Dashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Product[]>('/products')
      .then(r => setProducts(r.data))
      .finally(() => setLoading(false));
  }, []);

  const lowStock = products.filter(p => p.quantity <= p.lowStockThreshold);
  const totalProducts = products.length;
  const totalUnits = products.reduce((s, p) => s + p.quantity, 0);

  if (loading) return <div style={styles.loading}>Loading...</div>;

  return (
    <div style={styles.page}>
      <h2 style={styles.heading}>Dashboard</h2>

      <div style={styles.stats}>
        <StatCard label="Total Products" value={totalProducts} color="#3b82f6" />
        <StatCard label="Total Units" value={totalUnits} color="#10b981" />
        <StatCard label="Low Stock Alerts" value={lowStock.length} color="#ef4444" />
      </div>

      <h3 style={styles.subheading}>⚠️ Low Stock Items ({lowStock.length})</h3>
      {lowStock.length === 0 ? (
        <p style={styles.empty}>All items are sufficiently stocked.</p>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              {['SKU', 'Name', 'Category', 'Quantity', 'Threshold'].map(h => (
                <th key={h} style={styles.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {lowStock.map(p => (
              <tr key={p._id} style={styles.row}>
                <td style={styles.td}><code>{p.sku}</code></td>
                <td style={styles.td}>{p.name}</td>
                <td style={styles.td}>{p.category}</td>
                <td style={{ ...styles.td, color: p.quantity === 0 ? '#ef4444' : '#f59e0b', fontWeight: 600 }}>
                  {p.quantity}
                </td>
                <td style={styles.td}>{p.lowStockThreshold}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div style={styles.actions}>
        <Link to="/products" style={styles.actionLink}>Manage Products →</Link>
        <Link to="/orders" style={styles.actionLink}>View Orders →</Link>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ ...styles.card, borderTop: `4px solid ${color}` }}>
      <div style={{ fontSize: '2rem', fontWeight: 700, color }}>{value}</div>
      <div style={{ color: '#64748b', fontSize: '0.9rem' }}>{label}</div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { padding: '1.5rem', maxWidth: '1000px', margin: '0 auto' },
  heading: { color: '#1e293b', marginBottom: '1.25rem' },
  subheading: { color: '#1e293b', marginTop: '2rem', marginBottom: '0.75rem' },
  stats: { display: 'flex', gap: '1rem', flexWrap: 'wrap' },
  card: { background: '#fff', padding: '1.25rem 1.5rem', borderRadius: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', minWidth: '160px', flex: 1 },
  table: { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
  th: { background: '#f1f5f9', padding: '0.65rem 1rem', textAlign: 'left', fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' },
  td: { padding: '0.65rem 1rem', borderTop: '1px solid #f1f5f9', fontSize: '0.9rem' },
  row: { transition: 'background 0.15s' },
  empty: { color: '#64748b', fontStyle: 'italic' },
  loading: { padding: '2rem', textAlign: 'center', color: '#64748b' },
  actions: { marginTop: '2rem', display: 'flex', gap: '1rem' },
  actionLink: { color: '#3b82f6', textDecoration: 'none', fontWeight: 500 },
};
