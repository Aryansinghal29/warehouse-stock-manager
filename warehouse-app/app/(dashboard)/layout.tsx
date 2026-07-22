'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !token) router.replace('/signin');
  }, [token, router, mounted]);

  if (!mounted) return null;
  if (!token) return null;

  return (
    <>
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-6">{children}</main>
    </>
  );
}
