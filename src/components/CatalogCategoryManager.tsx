'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { getToken } from '@/lib/auth';
import type { BusinessCatalogCategory, CatalogCategoryType } from '@/types/mercadito';

const typeLabels: Record<CatalogCategoryType, string> = {
  product: 'Productos',
  service: 'Servicios',
  both: 'Productos y servicios',
};

export function CatalogCategoryManager() {
  const [categories, setCategories] = useState<BusinessCatalogCategory[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    description: '',
    type: 'both' as CatalogCategoryType,
    active: true,
  });

  const load = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    try {
      const data = await apiFetch<BusinessCatalogCategory[]>(
        '/business/catalog-categories',
        { token },
      );
      setCategories(data);
      setError('');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudieron cargar las categorias',
      );
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const token = getToken();
    if (!token) return;

    try {
      await apiFetch(
        editingId
          ? `/business/catalog-categories/${editingId}`
          : '/business/catalog-categories',
        {
          method: editingId ? 'PATCH' : 'POST',
          token,
          body: JSON.stringify(form),
        },
      );

      setEditingId(null);
      setForm({ name: '', description: '', type: 'both', active: true });
      await load();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo guardar la categoria',
      );
    }
  }

  async function remove(id: string) {
    const token = getToken();
    if (!token) return;
    await apiFetch(`/business/catalog-categories/${id}`, {
      method: 'DELETE',
      token,
    });
    await load();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <form className="surface h-fit rounded-lg p-5" onSubmit={submit}>
        <p className="text-sm font-semibold uppercase tracking-wide text-jade">
          Catalogo
        </p>
        <h1 className="mt-1 text-2xl font-bold text-ink">
          Categorias del negocio
        </h1>
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
            <span className="text-sm font-medium">Aplica para</span>
            <select
              className="field mt-1"
              value={form.type}
              onChange={(event) =>
                setForm({
                  ...form,
                  type: event.target.value as CatalogCategoryType,
                })
              }
            >
              <option value="both">Productos y servicios</option>
              <option value="product">Productos</option>
              <option value="service">Servicios</option>
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(event) =>
                setForm({ ...form, active: event.target.checked })
              }
            />
            Activa
          </label>
        </div>
        <div className="mt-5 flex gap-2">
          <button className="btn-primary">
            {editingId ? 'Actualizar' : 'Crear categoria'}
          </button>
          {editingId ? (
            <button
              className="btn-secondary"
              type="button"
              onClick={() => {
                setEditingId(null);
                setForm({ name: '', description: '', type: 'both', active: true });
              }}
            >
              Cancelar
            </button>
          ) : null}
        </div>
        {error ? (
          <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {error.includes('Business not found')
              ? 'Primero crea y guarda los datos del negocio en la pantalla Negocio.'
              : error}
          </p>
        ) : null}
      </form>

      <div className="space-y-3">
        {categories.map((category) => (
          <article
            key={category._id}
            className="surface flex flex-col justify-between gap-4 rounded-lg p-4 md:flex-row md:items-center"
          >
            <div>
              <h2 className="font-semibold text-ink">{category.name}</h2>
              <p className="mt-1 text-sm text-black/60">
                {category.description || typeLabels[category.type]}
              </p>
              <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-jade">
                {typeLabels[category.type]} · {category.active ? 'Activa' : 'Inactiva'}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                className="btn-secondary"
                onClick={() => {
                  setEditingId(category._id);
                  setForm({
                    name: category.name,
                    description: category.description || '',
                    type: category.type,
                    active: category.active,
                  });
                }}
              >
                Editar
              </button>
              <button
                className="btn-secondary"
                onClick={() => void remove(category._id)}
              >
                Eliminar
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
