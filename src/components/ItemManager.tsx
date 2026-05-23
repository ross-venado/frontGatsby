'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { ImageUrlField } from '@/components/ImageUrlField';
import { apiFetch, money } from '@/lib/api';
import { getToken } from '@/lib/auth';
import type {
  BusinessCatalogCategory,
  Product,
  Service,
} from '@/types/mercadito';

type Mode = 'products' | 'services';

type ItemManagerProps = {
  mode: Mode;
};

type FormItem = {
  name: string;
  description: string;
  category: string;
  price: string;
  priceFrom: string;
  priceTo: string;
  imageUrl: string;
  status: string;
};

const emptyForm: FormItem = {
  name: '',
  description: '',
  category: '',
  price: '',
  priceFrom: '',
  priceTo: '',
  imageUrl: '',
  status: 'active',
};

export function ItemManager({ mode }: ItemManagerProps) {
  const [items, setItems] = useState<Array<Product | Service>>([]);
  const [categories, setCategories] = useState<BusinessCatalogCategory[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormItem>(emptyForm);
  const [error, setError] = useState('');

  const basePath = mode === 'products' ? '/business/products' : '/business/services';
  const title = mode === 'products' ? 'Productos' : 'Servicios';

  const load = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    const data = await apiFetch<Array<Product | Service>>(basePath, { token });
    setItems(data);

    const categoryData = await apiFetch<BusinessCatalogCategory[]>(
      '/business/catalog-categories',
      { token },
    );
    setCategories(
      categoryData.filter((category) =>
        mode === 'products'
          ? category.type === 'product' || category.type === 'both'
          : category.type === 'service' || category.type === 'both',
      ),
    );
  }, [basePath, mode]);

  useEffect(() => {
    void load().catch((err) =>
      setError(err instanceof Error ? err.message : 'No se pudo cargar'),
    );
  }, [load]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    const token = getToken();
    if (!token) return;

    const images = form.imageUrl ? [form.imageUrl] : [];
    const payload =
      mode === 'products'
        ? {
            name: form.name,
            description: form.description,
            category: form.category,
            price: Number(form.price || 0),
            images,
            status: form.status,
          }
        : {
            name: form.name,
            description: form.description,
            category: form.category,
            priceFrom: form.priceFrom ? Number(form.priceFrom) : undefined,
            priceTo: form.priceTo ? Number(form.priceTo) : undefined,
            images,
            status: form.status,
          };

    try {
      await apiFetch(editingId ? `${basePath}/${editingId}` : basePath, {
        method: editingId ? 'PATCH' : 'POST',
        token,
        body: JSON.stringify(payload),
      });

      setForm(emptyForm);
      setEditingId(null);
      await load();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo guardar. Revisa la imagen o intenta con un link.',
      );
    }
  }

  async function remove(id: string) {
    const token = getToken();
    if (!token) return;
    await apiFetch(`${basePath}/${id}`, { method: 'DELETE', token });
    await load();
  }

  function edit(item: Product | Service) {
    setEditingId(item._id);
    setForm({
      name: item.name,
      description: item.description || '',
      category: item.category || '',
      price: 'price' in item ? String(item.price || '') : '',
      priceFrom: 'priceFrom' in item ? String(item.priceFrom || '') : '',
      priceTo: 'priceTo' in item ? String(item.priceTo || '') : '',
      imageUrl: item.images?.[0] || '',
      status: item.status,
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <form className="surface h-fit rounded-lg p-5" onSubmit={submit}>
        <p className="text-sm font-semibold uppercase tracking-wide text-jade">
          {editingId ? 'Editar' : 'Crear'}
        </p>
        <h1 className="mt-1 text-2xl font-bold text-ink">{title}</h1>

        <div className="mt-5 space-y-4">
          <label className="block">
            <span className="text-sm font-medium">Nombre</span>
            <input
              className="field mt-1"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              required
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Descripcion</span>
            <textarea
              className="field mt-1 min-h-20"
              value={form.description}
              onChange={(event) =>
                setForm({ ...form, description: event.target.value })
              }
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Categoria interna</span>
            <select
              className="field mt-1"
              value={form.category}
              onChange={(event) =>
                setForm({ ...form, category: event.target.value })
              }
            >
              <option value="">Sin categoria</option>
              {categories.map((category) => (
                <option key={category._id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          {mode === 'products' ? (
            <label className="block">
              <span className="text-sm font-medium">Precio</span>
              <input
                className="field mt-1"
                type="number"
                value={form.price}
                onChange={(event) =>
                  setForm({ ...form, price: event.target.value })
                }
                required
              />
            </label>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-sm font-medium">Desde</span>
                <input
                  className="field mt-1"
                  type="number"
                  value={form.priceFrom}
                  onChange={(event) =>
                    setForm({ ...form, priceFrom: event.target.value })
                  }
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium">Hasta</span>
                <input
                  className="field mt-1"
                  type="number"
                  value={form.priceTo}
                  onChange={(event) =>
                    setForm({ ...form, priceTo: event.target.value })
                  }
                />
              </label>
            </div>
          )}

          <ImageUrlField
            label="Imagen"
            value={form.imageUrl}
            onChange={(value) => setForm({ ...form, imageUrl: value })}
            previewLabel={`Imagen de ${form.name || title}`}
          />
          <label className="block">
            <span className="text-sm font-medium">Estado</span>
            <select
              className="field mt-1"
              value={form.status}
              onChange={(event) =>
                setForm({ ...form, status: event.target.value })
              }
            >
              <option value="active">Activo</option>
              <option value="inactive">Inactivo</option>
              {mode === 'products' ? <option value="sold_out">Agotado</option> : null}
            </select>
          </label>
        </div>

        {error ? <p className="mt-4 text-sm text-red-700">{error}</p> : null}
        <div className="mt-5 flex gap-2">
          <button className="btn-primary">{editingId ? 'Actualizar' : 'Crear'}</button>
          {editingId ? (
            <button
              className="btn-secondary"
              type="button"
              onClick={() => {
                setEditingId(null);
                setForm(emptyForm);
              }}
            >
              Cancelar
            </button>
          ) : null}
        </div>
      </form>

      <div className="space-y-3">
        {items.map((item) => (
          <article
            key={item._id}
            className="surface flex flex-col gap-4 overflow-hidden rounded-lg p-4 sm:flex-row sm:items-center"
          >
            <div className="h-28 w-full shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-jade/15 via-maize/20 to-clay/15 sm:w-32">
              {item.images?.[0] ? (
                <div
                  aria-hidden="true"
                  className="h-full w-full bg-cover bg-center"
                  style={{ backgroundImage: `url(${item.images[0]})` }}
                />
              ) : null}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="truncate font-semibold text-ink">{item.name}</h2>
              <p className="mt-1 line-clamp-2 text-sm text-black/60">
                {item.description || item.category || 'Sin descripcion'}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <p className="text-sm font-bold text-jade">
                  {'price' in item
                    ? money(item.price)
                    : `${money(item.priceFrom)} - ${money(item.priceTo)}`}
                </p>
                <span className="rounded-full bg-black/5 px-2 py-1 text-xs font-semibold text-black/55">
                  {item.status}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:flex sm:shrink-0">
              <button className="btn-secondary" onClick={() => edit(item)}>
                Editar
              </button>
              <button className="btn-secondary" onClick={() => void remove(item._id)}>
                Eliminar
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
