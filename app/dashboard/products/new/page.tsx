'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { ProductRequest, ProductResponse } from '@/lib/types';
import { ProductForm } from '@/components/ProductForm';

export default function NewProductPage() {
  const router = useRouter();

  async function handleSubmit(request: ProductRequest) {
    const product = await api.post<ProductResponse>('/api/products', request);
    // Image upload needs an existing product id, so send them straight to
    // the edit page where they can add a photo next.
    router.push(`/dashboard/products/${product.id}?created=1`);
  }

  return (
    <div>
      <Link href="/dashboard/products" className="btn-ghost">
        ← Back to inventory
      </Link>
      <h1 className="mt-4 font-display text-[28px]">Add an item</h1>
      <p className="mt-1 font-sans text-[14px] text-muted">
        It&rsquo;ll appear on your storefront as soon as you save it.
      </p>
      <div className="mt-8">
        <ProductForm submitLabel="Add item" onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
