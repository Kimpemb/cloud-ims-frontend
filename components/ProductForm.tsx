'use client';

import { useState } from 'react';
import type { ProductRequest } from '@/lib/types';
import { ErrorNote } from './ErrorNote';

export interface ProductFormValues {
  name: string;
  description: string;
  brand: string;
  size: string;
  condition: string;
  price: string;
}

const EMPTY: ProductFormValues = {
  name: '',
  description: '',
  brand: '',
  size: '',
  condition: '',
  price: '',
};

export function ProductForm({
  initialValues,
  submitLabel,
  onSubmit,
}: {
  initialValues?: Partial<ProductFormValues>;
  submitLabel: string;
  onSubmit: (request: ProductRequest) => Promise<void>;
}) {
  const [values, setValues] = useState<ProductFormValues>({ ...EMPTY, ...initialValues });
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  function update<K extends keyof ProductFormValues>(key: K, value: string) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    const price = Number(values.price);
    if (Number.isNaN(price) || price < 0) {
      setFieldErrors({ price: 'Enter a valid price.' });
      return;
    }
    setLoading(true);
    try {
      await onSubmit({
        name: values.name.trim(),
        description: values.description.trim() || undefined,
        brand: values.brand.trim() || undefined,
        size: values.size.trim() || undefined,
        condition: values.condition.trim() || undefined,
        price,
      });
    } catch (err: any) {
      if (err?.fieldErrors) {
        setFieldErrors(err.fieldErrors);
      } else {
        setError(err?.message ?? 'Something went wrong. Try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-5">
      <div>
        <label className="field-label" htmlFor="name">
          Name
        </label>
        <input
          id="name"
          className="field-input"
          value={values.name}
          onChange={(e) => update('name', e.target.value)}
          placeholder="Vintage Nike Jacket"
          required
        />
        {fieldErrors.name && <p className="mt-1.5 font-sans text-[13px] text-sold">{fieldErrors.name}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="field-label" htmlFor="brand">
            Brand
          </label>
          <input
            id="brand"
            className="field-input"
            value={values.brand}
            onChange={(e) => update('brand', e.target.value)}
            placeholder="Nike"
          />
        </div>
        <div>
          <label className="field-label" htmlFor="size">
            Size
          </label>
          <input
            id="size"
            className="field-input"
            value={values.size}
            onChange={(e) => update('size', e.target.value)}
            placeholder="L"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="field-label" htmlFor="condition">
            Condition
          </label>
          <input
            id="condition"
            className="field-input"
            value={values.condition}
            onChange={(e) => update('condition', e.target.value)}
            placeholder="Excellent"
          />
        </div>
        <div>
          <label className="field-label" htmlFor="price">
            Price (GH₵)
          </label>
          <input
            id="price"
            type="number"
            min="0"
            step="0.01"
            className="field-input"
            value={values.price}
            onChange={(e) => update('price', e.target.value)}
            required
          />
          {fieldErrors.price && <p className="mt-1.5 font-sans text-[13px] text-sold">{fieldErrors.price}</p>}
        </div>
      </div>

      <div>
        <label className="field-label" htmlFor="description">
          Description
        </label>
        <textarea
          id="description"
          className="field-input min-h-[100px] resize-y"
          value={values.description}
          onChange={(e) => update('description', e.target.value)}
        />
      </div>

      <ErrorNote message={error} />

      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? 'Saving…' : submitLabel}
      </button>
    </form>
  );
}
