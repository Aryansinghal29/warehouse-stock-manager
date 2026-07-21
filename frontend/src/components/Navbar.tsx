import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, signout } = useAuth();
  const navigate = useNavigate();

  const handleSignout = () => {
    signout();
    navigate('/signin');
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.brand}>
        <Link to="/dashboard" style={styles.brandLink}>📦 Warehouse</Link>
      </div>
      <div style={styles.links}>
        <Link to="/dashboard" style={styles.link}>Dashboard</Link>
        <Link to="/products" style={styles.link}>Products</Link>
        <Link to="/orders" style={styles.link}>Orders</Link>
        <span style={styles.user}>Hi, {user?.name}</span>
        <button onClick={handleSignout} style={styles.btn}>Sign Out</button>
      </div>
    </nav>
  );
}

const styles: Record<string, React.CSSProperties> = {
  nav: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1.5rem', background: '#1e293b', color: '#f1f5f9' },
  brand: { fontWeight: 700, fontSize: '1.1rem' },
  brandLink: { color: '#f1f5f9', textDecoration: 'none' },
  links: { display: 'flex', alignItems: 'center', gap: '1rem' },
  link: { color: '#94a3b8', textDecoration: 'none', fontSize: '0.9rem' },
  user: { color: '#64748b', fontSize: '0.85rem' },
  btn: { background: '#ef4444', color: '#fff', border: 'none', padding: '0.35rem 0.75rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' },
};
