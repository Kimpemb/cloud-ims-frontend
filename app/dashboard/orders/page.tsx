'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, ApiError } from '@/lib/api';
import { clearStoredSeller, isAuthError } from '@/lib/auth';
import { formatPrice, formatDateTime } from '@/lib/format';
import { NEXT_ORDER_STATUSES, type OrderResponse, type OrderStatus } from '@/lib/types';
import { OrderStatusStamp } from '@/components/StatusStamp';
import { ErrorNote } from '@/components/ErrorNote';

const ACTION_LABEL: Record<OrderStatus, string> = {
  CONFIRMED: 'Confirm',
  CANCELLED: 'Cancel',
  COMPLETED: 'Mark complete',
  PENDING: 'Reopen',
};

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<OrderResponse[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  async function load() {
    try {
      const data = await api.get<OrderResponse[]>('/api/orders');
      setOrders(data.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)));
    } catch (err) {
      if (err instanceof ApiError && isAuthError(err.status)) {
        clearStoredSeller();
        router.replace('/login');
        return;
      }
      setError(err instanceof ApiError ? err.message : 'Could not load your orders.');
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function updateStatus(orderId: number, status: OrderStatus) {
    setUpdatingId(orderId);
    setError(null);
    try {
      const updated = await api.put<OrderResponse>(`/api/orders/${orderId}/status`, { status });
      setOrders((prev) => prev?.map((o) => (o.id === orderId ? updated : o)) ?? null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not update that order.');
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div>
      <h1 className="font-display text-[28px]">Orders</h1>
      <p className="mt-1 font-sans text-[14px] text-muted">
        {orders ? `${orders.length} order${orders.length === 1 ? '' : 's'}` : 'Loading…'}
      </p>

      <div className="mt-6">
        <ErrorNote message={error} />
      </div>

      {orders && orders.length === 0 && (
        <div className="mt-16 border-t border-line pt-10">
          <p className="font-display text-[20px] italic">No orders yet.</p>
          <p className="mt-2 max-w-sm font-sans text-[14px] text-muted">
            When a buyer orders something from your storefront, it&rsquo;ll show up here.
          </p>
        </div>
      )}

      {orders && orders.length > 0 && (
        <div className="mt-8">
          {orders.map((order) => (
            <div key={order.id} className="ledger-row items-start sm:items-center">
              <div className="min-w-0 flex-1">
                <p className="font-sans text-[15px] font-medium">{order.productName}</p>
                <p className="font-sans text-[13px] text-muted">
                  {order.buyerName} · {order.buyerContact}
                </p>
                <p className="mt-0.5 font-mono text-[12px] text-muted">
                  {formatDateTime(order.createdAt)}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-2 sm:flex-row sm:items-center sm:gap-4">
                <span className="font-mono text-[14px]">{formatPrice(order.totalAmount)}</span>
                <OrderStatusStamp status={order.status} />
                <div className="flex gap-2">
                  {NEXT_ORDER_STATUSES[order.status].map((next) => (
                    <button
                      key={next}
                      onClick={() => updateStatus(order.id, next)}
                      disabled={updatingId === order.id}
                      className={next === 'CANCELLED' ? 'btn-ghost' : 'btn-secondary'}
                    >
                      {updatingId === order.id ? '…' : ACTION_LABEL[next]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
