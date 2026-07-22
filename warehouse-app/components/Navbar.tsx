'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const { user, signout } = useAuth();
  const router = useRouter();

  const handleSignout = () => {
    signout();
    router.push('/signin');
  };

  return (
    <nav className="bg-slate-800 text-slate-100 px-6 py-3 flex items-center justify-between">
      <Link href="/dashboard" className="font-bold text-lg text-white no-underline">
        📦 Warehouse
      </Link>
      <div className="flex items-center gap-5">
        <Link href="/dashboard" className="text-slate-300 hover:text-white text-sm">Dashboard</Link>
        <Link href="/products" className="text-slate-300 hover:text-white text-sm">Products</Link>
        <Link href="/orders" className="text-slate-300 hover:text-white text-sm">Orders</Link>
        <Link href="/rate-quote" className="text-slate-300 hover:text-white text-sm">Rate Quote</Link>
        <span className="text-slate-500 text-sm">Hi, {user?.name}</span>
        <button
          onClick={handleSignout}
          className="bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-1.5 rounded cursor-pointer border-0"
        >
          Sign Out
        </button>
      </div>
    </nav>
  );
}
