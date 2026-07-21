import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../types';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function SignUp() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signup(form.name, form.email, form.password);
      toast.success('Account created!');
      navigate('/dashboard');
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const data = err.response?.data as ApiError;
        const msg = data?.errors?.[0]?.msg || data?.message || 'Signup failed';
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h2 style={styles.title}>Create Account</h2>
        <input style={styles.input} placeholder="Full Name" value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
        <input style={styles.input} type="email" placeholder="Email" value={form.email}
          onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
        <input style={styles.input} type="password" placeholder="Password (min 6 chars)" value={form.password}
          onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required minLength={6} />
        <button style={styles.btn} type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Sign Up'}
        </button>
        <p style={styles.footer}>Already have an account? <Link to="/signin">Sign In</Link></p>
      </form>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' },
  form: { background: '#fff', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 12px rgba(0,0,0,0.1)', width: '100%', maxWidth: '380px', display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  title: { margin: 0, marginBottom: '0.5rem', color: '#1e293b' },
  input: { padding: '0.6rem 0.75rem', border: '1px solid #e2e8f0', borderRadius: '4px', fontSize: '0.95rem' },
  btn: { padding: '0.65rem', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem' },
  footer: { textAlign: 'center', fontSize: '0.85rem', color: '#64748b', margin: 0 },
};
