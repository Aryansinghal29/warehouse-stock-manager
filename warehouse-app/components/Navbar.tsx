'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const NAV_LINKS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/products', label: 'Products' },
  { href: '/orders', label: 'Orders' },
  { href: '/rate-quote', label: 'Rate Quote' },
];

export default function Navbar() {
  const { user, signout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const handleSignout = () => {
    signout();
    router.push('/signin');
  };

  return (
    <nav className="bg-slate-800 text-slate-100">
      <div className="px-4 sm:px-6 py-3 flex items-center justify-between">
        {/* Brand */}
        <Link href="/dashboard" className="font-bold text-lg text-white no-underline">
          📦 Warehouse
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-5">
          {NAV_LINKS.map(l => (
            <Link key={l.href} href={l.href}
              className={`text-sm transition-colors ${pathname === l.href ? 'text-white font-semibold' : 'text-slate-300 hover:text-white'}`}>
              {l.label}
            </Link>
          ))}
          <span className="text-slate-500 text-sm border-l border-slate-600 pl-4">Hi, {user?.name?.split(' ')[0]}</span>
          <button onClick={handleSignout}
            className="bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-1.5 rounded cursor-pointer border-0 transition-colors">
            Sign Out
          </button>
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden flex flex-col gap-1.5 p-1" onClick={() => setOpen(o => !o)} aria-label="Toggle menu">
          <span className={`block w-6 h-0.5 bg-slate-300 transition-transform duration-200 ${open ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`block w-6 h-0.5 bg-slate-300 transition-opacity duration-200 ${open ? 'opacity-0' : ''}`} />
          <span className={`block w-6 h-0.5 bg-slate-300 transition-transform duration-200 ${open ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-slate-700 px-4 py-3 flex flex-col gap-1">
          {NAV_LINKS.map(l => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
              className={`py-2.5 px-3 rounded-md text-sm transition-colors ${pathname === l.href ? 'bg-slate-700 text-white font-semibold' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}>
              {l.label}
            </Link>
          ))}
          <div className="border-t border-slate-700 mt-2 pt-2 flex items-center justify-between">
            <span className="text-slate-400 text-sm">Hi, {user?.name?.split(' ')[0]}</span>
            <button onClick={handleSignout}
              className="bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-1.5 rounded border-0 cursor-pointer">
              Sign Out
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
