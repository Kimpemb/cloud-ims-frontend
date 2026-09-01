import type { OrderStatus, ProductStatus } from '@/lib/types';

const PRODUCT_CLASS: Record<ProductStatus, string> = {
  AVAILABLE: 'stamp-available',
  RESERVED: 'stamp-reserved',
  SOLD: 'stamp-sold',
};

const ORDER_CLASS: Record<OrderStatus, string> = {
  PENDING: 'stamp-pending',
  CONFIRMED: 'stamp-confirmed',
  CANCELLED: 'stamp-cancelled',
  COMPLETED: 'stamp-completed',
};

export function ProductStatusStamp({ status }: { status: ProductStatus }) {
  return <span className={PRODUCT_CLASS[status]}>{status}</span>;
}

export function OrderStatusStamp({ status }: { status: OrderStatus }) {
  return <span className={ORDER_CLASS[status]}>{status}</span>;
}
