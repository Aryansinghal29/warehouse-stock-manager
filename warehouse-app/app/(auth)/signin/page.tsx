'use client';
import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function SignInPage() {
  const { signin } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signin(form.email, form.password);
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Sign in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-xl shadow-md w-full max-w-sm mx-4 flex flex-col gap-4">
      <h2 className="text-2xl font-bold text-slate-800">Sign In</h2>
      {error && <p className="text-red-500 text-sm bg-red-50 p-2 rounded">{error}</p>}
      <input className="input" type="email" placeholder="Email" value={form.email}
        onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
      <input className="input" type="password" placeholder="Password" value={form.password}
        onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
      <button className="btn-primary" type="submit" disabled={loading}>
        {loading ? 'Signing in...' : 'Sign In'}
      </button>
      <p className="text-center text-sm text-slate-500">
        No account? <Link href="/signup" className="text-blue-500">Sign Up</Link>
      </p>
    </form>
  );
}
