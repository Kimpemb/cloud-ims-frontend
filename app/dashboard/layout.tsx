'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getStoredSeller, clearStoredSeller } from '@/lib/auth';
import { api } from '@/lib/api';
import type { AuthResponse } from '@/lib/types';

const NAV = [
  { href: '/dashboard/products', label: 'Inventory' },
  { href: '/dashboard/orders', label: 'Orders' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [seller, setSeller] = useState<AuthResponse | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const stored = getStoredSeller();
    if (!stored) {
      router.replace('/login');
      return;
    }
    setSeller(stored);
    setChecked(true);
  }, [router]);

  async function handleLogout() {
    try {
      await api.post('/api/auth/logout');
    } catch {
      // Even if the network call fails, drop the local session state —
      // there's nothing useful to do with a failed logout except log in fresh.
    }
    clearStoredSeller();
    router.push('/login');
  }

  if (!checked || !seller) {
    return <div className="min-h-screen bg-paper" />;
  }

  return (
    <div className="min-h-screen bg-paper lg:flex">
      <aside className="flex flex-col border-b border-line px-6 py-6 lg:h-screen lg:w-60 lg:shrink-0 lg:border-b-0 lg:border-r lg:px-8 lg:py-10">
        <Link href="/" className="font-display text-[19px] italic">
          Cloud IMS
        </Link>
        <div className="mt-1 font-sans text-[13px] text-muted">
          {seller.businessName || `@${seller.username}`}
        </div>

        <nav className="mt-8 flex gap-5 lg:mt-10 lg:flex-col lg:gap-1">
          {NAV.map((item) => {
            const active = pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`font-sans text-[14px] lg:rounded-tag lg:px-3 lg:py-2 ${
                  active ? 'text-ink font-medium lg:bg-ink lg:text-paper' : 'text-muted hover:text-ink'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-8 flex flex-col gap-3 lg:mt-auto">
          <Link href={`/store/${seller.username}`} className="btn-ghost" target="_blank" rel="noreferrer">
            View your storefront
          </Link>
          <button onClick={handleLogout} className="btn-ghost text-left">
            Log out
          </button>
        </div>
      </aside>

      <main className="flex-1 px-6 py-8 lg:px-10 lg:py-10">{children}</main>
    </div>
  );
}
