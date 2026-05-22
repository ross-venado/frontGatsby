'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { BusinessQr } from '@/components/BusinessQr';
import { apiFetch } from '@/lib/api';
import { siteBaseUrl } from '@/lib/config';
import { getToken } from '@/lib/auth';
import type {
  Business,
  RestaurantTable,
  RestaurantTableStatus,
} from '@/types/mercadito';

type FormState = {
  name: string;
  code: string;
  status: RestaurantTableStatus;
  active: boolean;
};

const emptyForm: FormState = {
  name: '',
  code: '',
  status: 'free',
  active: true,
};

const tableStatusLabels: Record<RestaurantTableStatus, string> = {
  free: 'Libre',
  occupied: 'Ocupada',
  waiting_payment: 'Por cobrar',
  inactive: 'Inactiva',
};

export function RestaurantTablesManager() {
  const [business, setBusiness] = useState<Business | null>(null);
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    const token = getToken();
    if (!token) return;

    const [businessData, tableData] = await Promise.all([
      apiFetch<Business>('/business/me', { token }),
      apiFetch<RestaurantTable[]>('/business/restaurant/tables', { token }),
    ]);

    setBusiness(businessData);
    setTables(tableData);
  }, []);

  useEffect(() => {
    void load().catch((err) =>
      setError(err instanceof Error ? err.message : 'No se pudieron cargar mesas'),
    );
  }, [load]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setMessage('');
    const token = getToken();
    if (!token) return;

    await apiFetch(
      editingId
        ? `/business/restaurant/tables/${editingId}`
        : '/business/restaurant/tables',
      {
        method: editingId ? 'PATCH' : 'POST',
        token,
        body: JSON.stringify({
          name: form.name,
          code: form.code || undefined,
          status: form.active ? form.status : 'inactive',
          active: form.active,
        }),
      },
    );

    setForm(emptyForm);
    setEditingId(null);
    setMessage('Mesa guardada.');
    await load();
  }

  async function remove(id: string) {
    const token = getToken();
    if (!token) return;
    await apiFetch(`/business/restaurant/tables/${id}`, {
      method: 'DELETE',
      token,
    });
    await load();
  }

  function edit(table: RestaurantTable) {
    setEditingId(table._id);
    setForm({
      name: table.name,
      code: table.code,
      status: table.status,
      active: table.active,
    });
  }

  function tableUrl(table: RestaurantTable) {
    if (!business?.slug) return '';
    return `${siteBaseUrl}/r/${business.slug}/mesa/${table.qrSlug}`;
  }

  async function copy(value: string) {
    await navigator.clipboard.writeText(value);
    setMessage('Link copiado.');
  }

  const tableSummary = useMemo(
    () => ({
      total: tables.length,
      occupied: tables.filter((table) => table.status === 'occupied').length,
      waitingPayment: tables.filter((table) => table.status === 'waiting_payment')
        .length,
      free: tables.filter((table) => table.status === 'free').length,
      inactive: tables.filter((table) => !table.active || table.status === 'inactive')
        .length,
    }),
    [tables],
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <form className="surface h-fit rounded-lg p-5" onSubmit={submit}>
        <p className="text-sm font-semibold uppercase tracking-wide text-jade">
          Restaurante
        </p>
        <h1 className="mt-1 text-2xl font-bold text-ink">
          {editingId ? 'Editar mesa' : 'Crear mesa'}
        </h1>

        <div className="mt-5 space-y-4">
          <label className="block">
            <span className="text-sm font-medium">Nombre visible</span>
            <input
              className="field mt-1"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              placeholder="Mesa 1"
              required
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Codigo interno</span>
            <input
              className="field mt-1"
              value={form.code}
              onChange={(event) => setForm({ ...form, code: event.target.value })}
              placeholder="MESA-1"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Estado</span>
            <select
              className="field mt-1"
              value={form.status}
              onChange={(event) =>
                setForm({
                  ...form,
                  status: event.target.value as RestaurantTableStatus,
                })
              }
            >
              <option value="free">Libre</option>
              <option value="occupied">Ocupada</option>
              <option value="waiting_payment">Esperando pago</option>
              <option value="inactive">Inactiva</option>
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
            Mesa activa
          </label>
        </div>

        {error ? <p className="mt-4 text-sm text-red-700">{error}</p> : null}
        {message ? <p className="mt-4 text-sm text-jade">{message}</p> : null}
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

      <div className="space-y-4">
        <section className="surface rounded-lg p-5">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-jade">
              Mapa de mesas
            </p>
            <h2 className="mt-1 text-2xl font-bold text-ink">
              Estado operativo
            </h2>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-5">
            <div className="rounded-lg bg-black/[0.03] p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-black/45">
                Total
              </p>
              <p className="mt-1 text-xl font-bold text-ink">
                {tableSummary.total}
              </p>
            </div>
            <div className="rounded-lg bg-red-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-red-700">
                Ocupadas
              </p>
              <p className="mt-1 text-xl font-bold text-red-700">
                {tableSummary.occupied}
              </p>
            </div>
            <div className="rounded-lg bg-maize/15 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-black/45">
                Por cobrar
              </p>
              <p className="mt-1 text-xl font-bold text-ink">
                {tableSummary.waitingPayment}
              </p>
            </div>
            <div className="rounded-lg bg-jade/10 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-jade">
                Libres
              </p>
              <p className="mt-1 text-xl font-bold text-jade">
                {tableSummary.free}
              </p>
            </div>
            <div className="rounded-lg bg-black/[0.03] p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-black/45">
                Inactivas
              </p>
              <p className="mt-1 text-xl font-bold text-ink">
                {tableSummary.inactive}
              </p>
            </div>
          </div>
        </section>

        {tables.map((table) => {
          const url = tableUrl(table);
          return (
            <article key={table._id} className="surface overflow-hidden rounded-lg p-4">
              <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_220px]">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-bold text-ink">{table.name}</h2>
                    <span className="rounded-full bg-black/5 px-3 py-1 text-xs font-semibold text-black/60">
                      {tableStatusLabels[table.status]}
                    </span>
                    <span className="rounded-full bg-black/5 px-3 py-1 text-xs font-semibold text-black/60">
                      {table.active ? 'Activa' : 'Inactiva'}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-black/60">
                    Codigo: {table.code} · QR: {table.qrSlug}
                  </p>
                  <p className="mt-3 break-all text-sm text-black/60">{url}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button className="btn-secondary" onClick={() => edit(table)}>
                      Editar
                    </button>
                    <button className="btn-secondary" onClick={() => void copy(url)}>
                      Copiar link
                    </button>
                    <button className="btn-secondary" onClick={() => void remove(table._id)}>
                      Eliminar
                    </button>
                  </div>
                </div>
                <div className="flex justify-start xl:justify-end">
                  <BusinessQr
                    value={url || table.qrSlug}
                    label={`QR ${table.name}`}
                    size={168}
                  />
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
