export type ProductStatus = 'AVAILABLE' | 'RESERVED' | 'SOLD';
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

export interface AuthResponse {
  id: number;
  username: string;
  email: string;
  businessName: string | null;
}

export interface ProductResponse {
  id: number;
  name: string;
  description: string | null;
  brand: string | null;
  size: string | null;
  condition: string | null;
  price: number;
  imageUrl: string | null;
  status: ProductStatus;
  categoryId: number | null;
  categoryName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProductRequest {
  name: string;
  description?: string;
  brand?: string;
  size?: string;
  condition?: string;
  price: number;
  categoryId?: number | null;
}

export interface OrderResponse {
  id: number;
  productId: number;
  productName: string;
  buyerName: string;
  buyerContact: string;
  status: OrderStatus;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface SellerProfileResponse {
  username: string;
  businessName: string | null;
  availableProductCount: number;
}

export interface PlaceOrderRequest {
  productId: number;
  buyerName: string;
  buyerContact: string;
}

// The backend's next valid moves from each order status. Confirmed against
// the live test pass in SESSION_HANDOFF_2026-09-01_PHASE9.md: CONFIRMED ->
// PENDING is explicitly rejected with 409, so the state machine only ever
// moves forward or to CANCELLED. The backend is the source of truth here —
// this only controls which buttons the UI offers; a stale UI state still
// gets a clean 409 from the server if it's ever wrong.
export const NEXT_ORDER_STATUSES: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['COMPLETED', 'CANCELLED'],
  CANCELLED: [],
  COMPLETED: [],
};
