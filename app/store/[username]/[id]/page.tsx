'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api, ApiError } from '@/lib/api';
import { formatPrice } from '@/lib/format';
import type { OrderResponse, PlaceOrderRequest, ProductResponse } from '@/lib/types';
import { ProductStatusStamp } from '@/components/StatusStamp';
import { ErrorNote } from '@/components/ErrorNote';

export default function ProductDetailPage() {
  const params = useParams<{ username: string; id: string }>();
  const { username, id } = params;

  const [product, setProduct] = useState<ProductResponse | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [form, setForm] = useState({ buyerName: '', buyerContact: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [placedOrder, setPlacedOrder] = useState<OrderResponse | null>(null);

  async function load() {
    try {
      const data = await api.get<ProductResponse>(`/api/store/${username}/products/${id}`);
      setProduct(data);
    } catch (err) {
      setLoadError(
        err instanceof ApiError && err.status === 404
          ? "This item isn't available anymore."
          : 'Could not load this item.'
      );
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username, id]);

  async function handleOrder(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);
    setSubmitting(true);
    try {
      const request: PlaceOrderRequest = {
        productId: Number(id),
        buyerName: form.buyerName.trim(),
        buyerContact: form.buyerContact.trim(),
      };
      const order = await api.post<OrderResponse>(`/api/store/${username}/orders`, request);
      setPlacedOrder(order);
    } catch (err) {
      // A 409 here means someone else reserved it first — the exact race
      // condition this product is built to prevent. Re-load so the page
      // reflects the item's real current status instead of a stale one.
      setSubmitError(err instanceof ApiError ? err.message : 'Could not place that order.');
      load();
    } finally {
      setSubmitting(false);
    }
  }

  if (loadError) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-paper px-6">
        <div className="text-center">
          <p className="font-display text-[22px] italic">{loadError}</p>
          <Link href={`/store/${username}`} className="btn-ghost mt-4 inline-flex">
            Back to the shop
          </Link>
        </div>
      </main>
    );
  }

  if (!product) {
    return <main className="min-h-screen bg-paper" />;
  }

  return (
    <main className="min-h-screen bg-paper">
      <div className="mx-auto max-w-3xl px-6 py-10 sm:px-8">
        <Link href={`/store/${username}`} className="btn-ghost">
          ← Back to @{username}
        </Link>

        <div className="mt-6 grid gap-10 sm:grid-cols-2">
          <div className="aspect-square overflow-hidden rounded-tag border border-line bg-panel">
            {product.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
            ) : null}
          </div>

          <div>
            <h1 className="font-display text-[28px] leading-tight">{product.name}</h1>
            <p className="mt-1 font-sans text-[14px] text-muted">
              {[product.brand, product.size, product.condition].filter(Boolean).join(' · ')}
            </p>
            <div className="mt-3 flex items-center gap-3">
              <span className="font-mono text-[18px]">{formatPrice(product.price)}</span>
              <ProductStatusStamp status={product.status} />
            </div>

            {product.description && (
              <p className="mt-5 font-sans text-[15px] leading-relaxed text-ink/90">{product.description}</p>
            )}

            <div className="mt-8 border-t border-line pt-8">
              {product.status !== 'AVAILABLE' && !placedOrder && (
                <p className="font-sans text-[14px] text-muted">
                  This item is no longer available.
                </p>
              )}

              {product.status === 'AVAILABLE' && !placedOrder && (
                <form onSubmit={handleOrder} className="space-y-4">
                  <p className="font-sans text-[14px] font-medium">Place an order</p>
                  <div>
                    <label className="field-label" htmlFor="buyerName">
                      Your name
                    </label>
                    <input
                      id="buyerName"
                      className="field-input"
                      value={form.buyerName}
                      onChange={(e) => setForm((f) => ({ ...f, buyerName: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label className="field-label" htmlFor="buyerContact">
                      Phone or WhatsApp
                    </label>
                    <input
                      id="buyerContact"
                      className="field-input"
                      value={form.buyerContact}
                      onChange={(e) => setForm((f) => ({ ...f, buyerContact: e.target.value }))}
                      placeholder="0244 000 000"
                      required
                    />
                  </div>
                  <ErrorNote message={submitError} />
                  <button type="submit" className="btn-primary w-full" disabled={submitting}>
                    {submitting ? 'Placing order…' : `Order for ${formatPrice(product.price)}`}
                  </button>
                  <p className="font-sans text-[12px] text-muted">
                    The seller will reach out on the contact you provide to confirm payment.
                  </p>
                </form>
              )}

              {placedOrder && (
                <div>
                  <p className="font-display text-[19px] italic">Order placed.</p>
                  <p className="mt-2 font-sans text-[14px] text-muted">
                    The seller has reserved this item for you and will reach out on{' '}
                    {placedOrder.buyerContact} to confirm.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
