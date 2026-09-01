'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api, ApiError } from '@/lib/api';
import { clearStoredSeller, isAuthError } from '@/lib/auth';
import { formatPrice } from '@/lib/format';
import type { ProductResponse } from '@/lib/types';
import { ProductStatusStamp } from '@/components/StatusStamp';
import { ErrorNote } from '@/components/ErrorNote';

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<ProductResponse[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  async function load() {
    try {
      const data = await api.get<ProductResponse[]>('/api/products');
      setProducts(data);
    } catch (err) {
      if (err instanceof ApiError && isAuthError(err.status)) {
        clearStoredSeller();
        router.replace('/login');
        return;
      }
      setError(err instanceof ApiError ? err.message : 'Could not load your inventory.');
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleDelete(id: number, name: string) {
    if (!window.confirm(`Remove "${name}" from your inventory? This can't be undone.`)) return;
    setDeletingId(id);
    setError(null);
    try {
      await api.delete(`/api/products/${id}`);
      setProducts((prev) => prev?.filter((p) => p.id !== id) ?? null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not remove that item.');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-[28px]">Inventory</h1>
          <p className="mt-1 font-sans text-[14px] text-muted">
            {products ? `${products.length} item${products.length === 1 ? '' : 's'}` : 'Loading…'}
          </p>
        </div>
        <Link href="/dashboard/products/new" className="btn-primary">
          Add item
        </Link>
      </div>

      <div className="mt-6">
        <ErrorNote message={error} />
      </div>

      {products && products.length === 0 && (
        <div className="mt-16 border-t border-line pt-10">
          <p className="font-display text-[20px] italic">Nothing listed yet.</p>
          <p className="mt-2 max-w-sm font-sans text-[14px] text-muted">
            Add your first item and it&rsquo;ll show up on your storefront right away.
          </p>
          <Link href="/dashboard/products/new" className="btn-primary mt-6 inline-flex">
            Add your first item
          </Link>
        </div>
      )}

      {products && products.length > 0 && (
        <div className="mt-8">
          {products.map((product) => (
            <div key={product.id} className="ledger-row">
              <Link href={`/dashboard/products/${product.id}`} className="flex flex-1 items-center gap-4 min-w-0">
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-tag border border-line bg-panel">
                  {product.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={product.imageUrl} alt="" className="h-full w-full object-cover" />
                  ) : null}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-sans text-[15px] font-medium">{product.name}</p>
                  <p className="truncate font-sans text-[13px] text-muted">
                    {[product.brand, product.size, product.categoryName].filter(Boolean).join(' · ') || '—'}
                  </p>
                </div>
              </Link>
              <div className="flex shrink-0 items-center gap-4">
                <span className="font-mono text-[14px]">{formatPrice(product.price)}</span>
                <ProductStatusStamp status={product.status} />
                <button
                  onClick={() => handleDelete(product.id, product.name)}
                  disabled={deletingId === product.id}
                  className="btn-ghost"
                >
                  {deletingId === product.id ? 'Removing…' : 'Remove'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
