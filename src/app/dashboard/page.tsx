'use client';

import { FormEvent, useEffect, useState } from 'react';
import { AuthGuard } from '@/components/AuthGuard';
import { DashboardLayout } from '@/components/DashboardLayout';
import { ImageUrlField } from '@/components/ImageUrlField';
import { apiFetch } from '@/lib/api';
import { getToken } from '@/lib/auth';
import type { Business, BusinessCategory } from '@/types/mercadito';

export default function DashboardPage() {
  const [business, setBusiness] = useState<Business | null>(null);
  const [categories, setCategories] = useState<BusinessCategory[]>([]);
  const [message, setMessage] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    void apiFetch<Business>('/business/me', { token })
      .then((data) => {
        setBusiness(data);
        setLogoUrl(data.logoUrl || '');
        setCoverUrl(data.coverUrl || '');
      })
      .catch(() => setBusiness(null));

    void apiFetch<BusinessCategory[]>('/public/categories')
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setMessage('');
    const token = getToken();
    if (!token) return;

    const form = new FormData(event.currentTarget);
    const payload = {
      name: String(form.get('name') || ''),
      slug: String(form.get('slug') || ''),
      description: String(form.get('description') || ''),
      categoryId: String(form.get('categoryId') || '') || undefined,
      phone: String(form.get('phone') || ''),
      whatsapp: String(form.get('whatsapp') || ''),
      address: String(form.get('address') || ''),
      logoUrl,
      coverUrl,
      modules: business?.modules?.length ? business.modules : ['marketplace'],
    };

    try {
      const updated = await apiFetch<Business>('/business/me', {
        method: 'PATCH',
        token,
        body: JSON.stringify(payload),
      });

      setBusiness(updated);
      setMessage('Negocio guardado. Pide aprobacion al admin para aparecer publico.');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo guardar. Revisa las imagenes o intenta con links.',
      );
    }
  }

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="surface rounded-lg p-6">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-jade">
                Mi local digital
              </p>
              <h1 className="mt-1 text-3xl font-bold text-ink">Datos del negocio</h1>
            </div>
            {business ? (
              <span className="rounded-full bg-black/5 px-3 py-1 text-sm font-semibold text-black/60">
                {business.status} · {business.plan}
              </span>
            ) : null}
          </div>

          <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={submit}>
            <label className="block">
              <span className="text-sm font-medium">Nombre</span>
              <input
                className="field mt-1"
                name="name"
                defaultValue={business?.name || ''}
                required
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Slug</span>
              <input
                className="field mt-1"
                name="slug"
                defaultValue={business?.slug || ''}
                placeholder="mi-negocio"
              />
            </label>
            <label className="block md:col-span-2">
              <span className="text-sm font-medium">Descripcion</span>
              <textarea
                className="field mt-1 min-h-24"
                name="description"
                defaultValue={business?.description || ''}
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Categoria</span>
              <select
                className="field mt-1"
                name="categoryId"
                defaultValue={
                  typeof business?.categoryId === 'object'
                    ? business.categoryId._id
                    : business?.categoryId || ''
                }
              >
                <option value="">Seleccionar</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-medium">WhatsApp</span>
              <input
                className="field mt-1"
                name="whatsapp"
                defaultValue={business?.whatsapp || ''}
                placeholder="50255550000"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Telefono</span>
              <input className="field mt-1" name="phone" defaultValue={business?.phone || ''} />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Direccion</span>
              <input
                className="field mt-1"
                name="address"
                defaultValue={business?.address || ''}
              />
            </label>
            <ImageUrlField
              label="Logo"
              name="logoUrl"
              value={logoUrl}
              onChange={setLogoUrl}
              previewLabel="Logo del negocio"
            />
            <ImageUrlField
              label="Portada"
              name="coverUrl"
              value={coverUrl}
              onChange={setCoverUrl}
              previewLabel="Portada del negocio"
            />
            <div className="md:col-span-2">
              <button className="btn-primary">Guardar local</button>
              {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
              {message ? <p className="mt-3 text-sm text-jade">{message}</p> : null}
            </div>
          </form>
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}
