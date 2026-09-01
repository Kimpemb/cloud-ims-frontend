'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, ApiError } from '@/lib/api';
import { ErrorNote } from '@/components/ErrorNote';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: '', email: '', password: '', businessName: '' });
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setLoading(true);
    try {
      await api.post('/api/auth/register', {
        username: form.username,
        email: form.email,
        password: form.password,
        businessName: form.businessName || undefined,
      });
      router.push('/login?registered=1');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.fieldErrors ? null : err.message);
        setFieldErrors(err.fieldErrors ?? {});
      } else {
        setError('Something went wrong. Try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-6 py-16">
      <div className="w-full max-w-sm">
        <Link href="/" className="font-display text-[19px] italic">
          Cloud IMS
        </Link>
        <h1 className="mt-8 font-display text-[28px]">Create your storefront</h1>
        <p className="mt-1.5 font-sans text-[14px] text-muted">
          Your storefront will live at /store/{form.username || 'your-username'}.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label className="field-label" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              className="field-input"
              value={form.username}
              onChange={(e) => update('username', e.target.value)}
              autoComplete="username"
              minLength={3}
              maxLength={30}
              required
            />
            {fieldErrors.username && (
              <p className="mt-1.5 font-sans text-[13px] text-sold">{fieldErrors.username}</p>
            )}
          </div>
          <div>
            <label className="field-label" htmlFor="businessName">
              Business name <span className="text-muted">(optional, shown on your storefront)</span>
            </label>
            <input
              id="businessName"
              className="field-input"
              value={form.businessName}
              onChange={(e) => update('businessName', e.target.value)}
            />
          </div>
          <div>
            <label className="field-label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="field-input"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              autoComplete="email"
              required
            />
            {fieldErrors.email && <p className="mt-1.5 font-sans text-[13px] text-sold">{fieldErrors.email}</p>}
          </div>
          <div>
            <label className="field-label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="field-input"
              value={form.password}
              onChange={(e) => update('password', e.target.value)}
              autoComplete="new-password"
              minLength={8}
              required
            />
            <p className="mt-1.5 font-sans text-[13px] text-muted">At least 8 characters.</p>
            {fieldErrors.password && (
              <p className="mt-1.5 font-sans text-[13px] text-sold">{fieldErrors.password}</p>
            )}
          </div>

          <ErrorNote message={error} />

          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Creating…' : 'Create storefront'}
          </button>
        </form>

        <p className="mt-6 font-sans text-[14px] text-muted">
          Already selling here?{' '}
          <Link href="/login" className="text-ink underline underline-offset-4">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
