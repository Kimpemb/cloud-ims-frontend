// The MVP doc's worked examples price everything in Ghanaian cedi
// (GH₵850). The backend stores price as a plain decimal with no currency
// field, so the currency symbol is a display-layer choice, not backend
// data — swap this in one place if the seller base ever needs to change.
export function formatPrice(price: number): string {
  return `GH₵${price.toLocaleString('en-GH', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}
