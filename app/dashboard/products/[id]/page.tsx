'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api, ApiError } from '@/lib/api';
import type { ProductRequest, ProductResponse } from '@/lib/types';
import { ProductForm } from '@/components/ProductForm';
import { ErrorNote } from '@/components/ErrorNote';

export default function EditProductPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = params.id;

  const [product, setProduct] = useState<ProductResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function load() {
    try {
      const data = await api.get<ProductResponse>(`/api/products/${id}`);
      setProduct(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load this item.');
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleSubmit(request: ProductRequest) {
    const updated = await api.put<ProductResponse>(`/api/products/${id}`, request);
    router.push('/dashboard/products');
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      const form = new FormData();
      form.append('file', file);
      const updated = await api.postForm<ProductResponse>(`/api/products/${id}/image`, form);
      setProduct(updated);
    } catch (err) {
      setUploadError(err instanceof ApiError ? err.message : 'Could not upload that image.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  if (error) {
    return (
      <div>
        <Link href="/dashboard/products" className="btn-ghost">
          ← Back to inventory
        </Link>
        <div className="mt-6">
          <ErrorNote message={error} />
        </div>
      </div>
    );
  }

  if (!product) {
    return <div className="font-sans text-[14px] text-muted">Loading…</div>;
  }

  return (
    <div>
      <Link href="/dashboard/products" className="btn-ghost">
        ← Back to inventory
      </Link>

      {searchParams.get('created') && (
        <p className="mt-4 font-sans text-[14px] text-available">
          Item added. Add a photo below, or come back to it later.
        </p>
      )}

      <h1 className="mt-4 font-display text-[28px]">{product.name}</h1>

      <div className="mt-8 grid gap-10 lg:grid-cols-[200px_1fr]">
        <div>
          <p className="field-label">Photo</p>
          <div className="h-40 w-40 overflow-hidden rounded-tag border border-line bg-panel">
            {product.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={product.imageUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center font-sans text-[13px] text-muted">
                No photo yet
              </div>
            )}
          </div>
          <label className="btn-secondary mt-3 inline-flex cursor-pointer">
            {uploading ? 'Uploading…' : product.imageUrl ? 'Replace photo' : 'Upload photo'}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              disabled={uploading}
            />
          </label>
          {uploadError && <p className="mt-2 font-sans text-[13px] text-sold">{uploadError}</p>}
        </div>

        <ProductForm
          submitLabel="Save changes"
          initialValues={{
            name: product.name,
            description: product.description ?? '',
            brand: product.brand ?? '',
            size: product.size ?? '',
            condition: product.condition ?? '',
            price: String(product.price),
          }}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}
