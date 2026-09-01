'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, ApiError } from '@/lib/api';
import { setStoredSeller } from '@/lib/auth';
import type { AuthResponse } from '@/lib/types';
import { ErrorNote } from '@/components/ErrorNote';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const seller = await api.post<AuthResponse>('/api/auth/login', { username, password });
      setStoredSeller(seller);
      router.push('/dashboard/products');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-6">
      <div className="w-full max-w-sm">
        <Link href="/" className="font-display text-[19px] italic">
          Cloud IMS
        </Link>
        <h1 className="mt-8 font-display text-[28px]">Log in</h1>
        <p className="mt-1.5 font-sans text-[14px] text-muted">
          Manage your inventory and orders.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label className="field-label" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              className="field-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
          </div>
          <div>
            <label className="field-label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="field-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          <ErrorNote message={error} />

          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Logging in…' : 'Log in'}
          </button>
        </form>

        <p className="mt-6 font-sans text-[14px] text-muted">
          New here?{' '}
          <Link href="/register" className="text-ink underline underline-offset-4">
            Create a storefront
          </Link>
        </p>
      </div>
    </main>
  );
}
