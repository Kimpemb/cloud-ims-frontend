'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api, ApiError } from '@/lib/api';
import { formatPrice } from '@/lib/format';
import type { ProductResponse, SellerProfileResponse } from '@/lib/types';
import { ProductStatusStamp } from '@/components/StatusStamp';

const ALL = 'All';

export default function StorefrontPage() {
  const params = useParams<{ username: string }>();
  const username = params.username;

  const [profile, setProfile] = useState<SellerProfileResponse | null>(null);
  const [products, setProducts] = useState<ProductResponse[] | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [search, setSearch] = useState('');
  const [brand, setBrand] = useState(ALL);
  const [size, setSize] = useState(ALL);
  const [condition, setCondition] = useState(ALL);

  useEffect(() => {
    api
      .get<SellerProfileResponse>(`/api/store/${username}`)
      .then(setProfile)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 404) setNotFound(true);
      });
  }, [username]);

  useEffect(() => {
    const query = search.trim() ? `?search=${encodeURIComponent(search.trim())}` : '';
    api
      .get<ProductResponse[]>(`/api/store/${username}/products${query}`)
      .then(setProducts)
      .catch(() => setProducts([]));
  }, [username, search]);

  const brands = useMemo(
    () => [ALL, ...Array.from(new Set((products ?? []).map((p) => p.brand).filter(Boolean) as string[]))],
    [products]
  );
  const sizes = useMemo(
    () => [ALL, ...Array.from(new Set((products ?? []).map((p) => p.size).filter(Boolean) as string[]))],
    [products]
  );
  const conditions = useMemo(
    () => [ALL, ...Array.from(new Set((products ?? []).map((p) => p.condition).filter(Boolean) as string[]))],
    [products]
  );

  const visible = (products ?? []).filter(
    (p) =>
      (brand === ALL || p.brand === brand) &&
      (size === ALL || p.size === size) &&
      (condition === ALL || p.condition === condition)
  );

  if (notFound) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-paper px-6">
        <p className="font-display text-[22px] italic">No storefront at @{username}.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-paper">
      <header className="border-b border-line px-6 py-10 sm:px-8">
        <div className="mx-auto max-w-4xl">
          <p className="font-mono text-[13px] text-muted">@{username}</p>
          <h1 className="mt-1 font-display text-[34px]">
            {profile?.businessName || `@${username}`}
          </h1>
          {profile && (
            <p className="mt-1.5 font-sans text-[14px] text-muted">
              {profile.availableProductCount} item{profile.availableProductCount === 1 ? '' : 's'} available
            </p>
          )}
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-6 py-8 sm:px-8">
        <div className="flex flex-wrap items-center gap-3">
          <input
            className="field-input max-w-xs"
            placeholder="Search this shop…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <FilterSelect label="Brand" value={brand} options={brands} onChange={setBrand} />
          <FilterSelect label="Size" value={size} options={sizes} onChange={setSize} />
          <FilterSelect label="Condition" value={condition} options={conditions} onChange={setCondition} />
        </div>

        {products && visible.length === 0 && (
          <p className="mt-16 font-sans text-[14px] text-muted">
            {products.length === 0 ? 'Nothing available right now.' : 'No items match those filters.'}
          </p>
        )}

        {visible.length > 0 && (
          <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3">
            {visible.map((product) => (
              <Link key={product.id} href={`/store/${username}/${product.id}`} className="group block">
                <div className="aspect-square overflow-hidden rounded-tag border border-line bg-panel">
                  {product.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="h-full w-full object-cover transition-transform group-hover:scale-[1.03]"
                    />
                  ) : null}
                </div>
                <p className="mt-3 font-sans text-[14px] font-medium leading-snug">{product.name}</p>
                <p className="font-sans text-[13px] text-muted">
                  {[product.size, product.condition].filter(Boolean).join(' · ')}
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="font-mono text-[14px]">{formatPrice(product.price)}</span>
                  <ProductStatusStamp status={product.status} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  if (options.length <= 1) return null;
  return (
    <select
      aria-label={label}
      className="rounded-tag border border-line bg-panel px-3 py-2.5 font-sans text-[14px] text-ink focus:border-ink focus:outline-none"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {o === ALL ? `All ${label.toLowerCase()}s` : o}
        </option>
      ))}
    </select>
  );
}
