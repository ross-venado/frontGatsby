'use client';

import Link from 'next/link';
import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { apiFetch, money } from '@/lib/api';
import { getToken } from '@/lib/auth';
import type { Business, LiveLead, LiveSession, Product } from '@/types/mercadito';

type StatusAction = 'draft' | 'active' | 'ended';

const statusLabels: Record<StatusAction, string> = {
  draft: 'Borrador',
  active: 'Activo',
  ended: 'Finalizado',
};

export function LiveSalesManager() {
  const [business, setBusiness] = useState<Business | null>(null);
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [leads, setLeads] = useState<LiveLead[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [siteOrigin, setSiteOrigin] = useState('');

  const selectedSession = sessions.find((session) => session._id === selectedId) || sessions[0];

  const publicUrl =
    siteOrigin && business && selectedSession
      ? `${siteOrigin}/live/${business.slug}/${selectedSession.slug}`
      : '';

  const liveProductIds = useMemo(
    () => new Set(selectedSession?.items.map((item) => item.productId) || []),
    [selectedSession],
  );

  const availableProducts = useMemo(
    () => products.filter((product) => !liveProductIds.has(product._id)),
    [liveProductIds, products],
  );

  const load = useCallback(async () => {
    const token = getToken();
    if (!token) return;

    const [businessData, sessionData, productData] = await Promise.all([
      apiFetch<Business>('/business/me', { token }),
      apiFetch<LiveSession[]>('/business/live-sessions', { token }),
      apiFetch<Product[]>('/business/products', { token }),
    ]);

    setBusiness(businessData);
    setSessions(sessionData);
    setProducts(productData.filter((product) => product.status !== 'inactive'));
    if (!selectedId && sessionData[0]) {
      setSelectedId(sessionData[0]._id);
    }
  }, [selectedId]);

  const loadLeads = useCallback(async (sessionId: string) => {
    const token = getToken();
    if (!token || !sessionId) return;
    const leadData = await apiFetch<LiveLead[]>(
      `/business/live-sessions/${sessionId}/leads`,
      { token },
    );
    setLeads(leadData);
  }, []);

  useEffect(() => {
    setSiteOrigin(window.location.origin);
    void load().catch((err) =>
      setError(err instanceof Error ? err.message : 'No se pudo cargar venta en vivo'),
    );
  }, [load]);

  useEffect(() => {
    if (selectedSession?._id) {
      void loadLeads(selectedSession._id).catch(() => setLeads([]));
    }
  }, [loadLeads, selectedSession?._id]);

  async function createSession(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSaving) return;
    const token = getToken();
    if (!token) return;
    setError('');
    setMessage('');
    setIsSaving(true);

    try {
      const session = await apiFetch<LiveSession>('/business/live-sessions', {
        method: 'POST',
        token,
        body: JSON.stringify({
          title,
          productIds: products.map((product) => product._id),
        }),
      });
      setTitle('');
      setSelectedId(session._id);
      await load();
      setMessage('Sesion creada con tu catalogo listo para mostrar.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear la sesion');
    } finally {
      setIsSaving(false);
    }
  }

  async function updateSessionStatus(status: StatusAction) {
    if (!selectedSession || isSaving) return;
    const token = getToken();
    if (!token) return;
    setIsSaving(true);
    setError('');
    setMessage('');

    try {
      const updatedSession = await apiFetch<LiveSession>(`/business/live-sessions/${selectedSession._id}`, {
        method: 'PATCH',
        token,
        body: JSON.stringify({ status }),
      });
      setSessions((currentSessions) =>
        currentSessions.map((session) =>
          session._id === updatedSession._id ? updatedSession : session,
        ),
      );
      setSelectedId(updatedSession._id);
      await load();
      setMessage(
        status === 'ended'
          ? 'Live finalizado. El link publico quedo cerrado.'
          : 'Live activo. Ya puedes compartir el enlace.',
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar');
    } finally {
      setIsSaving(false);
    }
  }

  async function syncCatalog() {
    if (!selectedSession || isSaving || !availableProducts.length) return;
    const token = getToken();
    if (!token) return;
    setIsSaving(true);
    setError('');

    try {
      for (const product of availableProducts) {
        await apiFetch<LiveSession>(`/business/live-sessions/${selectedSession._id}/items`, {
          method: 'POST',
          token,
          body: JSON.stringify({ productId: product._id }),
        });
      }
      await load();
      setMessage('Catalogo sincronizado con el live.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo sincronizar el catalogo');
    } finally {
      setIsSaving(false);
    }
  }

  async function showNow(productId: string) {
    if (!selectedSession || isSaving) return;
    const token = getToken();
    if (!token) return;
    setIsSaving(true);
    setError('');

    try {
      await apiFetch<LiveSession>(
        `/business/live-sessions/${selectedSession._id}/current-product`,
        {
          method: 'POST',
          token,
          body: JSON.stringify({ productId }),
        },
      );
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo mostrar');
    } finally {
      setIsSaving(false);
    }
  }

  async function updateItem(
    productId: string,
    payload: { stockOverride?: number; status?: 'available' | 'sold_out' },
  ) {
    if (!selectedSession || isSaving) return;
    const token = getToken();
    if (!token) return;
    setIsSaving(true);
    setError('');

    try {
      await apiFetch<LiveSession>(
        `/business/live-sessions/${selectedSession._id}/items/${productId}`,
        {
          method: 'PATCH',
          token,
          body: JSON.stringify(payload),
        },
      );
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar producto');
    } finally {
      setIsSaving(false);
    }
  }

  async function copyPublicLink() {
    if (!publicUrl) return;
    await navigator.clipboard.writeText(publicUrl);
    setMessage('Enlace copiado');
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl border border-black/10 bg-ink text-white shadow-soft">
        <div className="grid gap-5 p-5 md:grid-cols-[1fr_320px] md:p-7">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-jade">
              Live ventas
            </p>
            <h1 className="mt-2 text-3xl font-black leading-tight md:text-4xl">
              Controla lo que aparece en tu venta en vivo
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/65">
              Comparte un link en Facebook o TikTok. Mientras transmites, toca
              el producto que estas mostrando y tus clientes lo ven con codigo,
              precio, stock e historial.
            </p>
          </div>
          <form className="rounded-2xl border border-white/10 bg-white/10 p-4" onSubmit={createSession}>
            <p className="text-xs font-black uppercase tracking-wide text-white/55">
              Nueva sesion
            </p>
            <input
              className="field mt-3 bg-white text-ink"
              disabled={isSaving}
              placeholder="Live viernes 8 PM"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
            />
            <button className="btn-primary mt-3 w-full justify-center" disabled={isSaving}>
              {isSaving ? 'Guardando...' : 'Crear live'}
            </button>
          </form>
        </div>
      </section>

      {error ? <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
      {message ? <p className="rounded-xl bg-jade/10 p-3 text-sm font-bold text-jade">{message}</p> : null}

      <section className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <aside className="surface h-fit rounded-2xl p-4">
          <p className="text-sm font-black uppercase tracking-wide text-jade">
            Sesiones
          </p>
          <div className="mt-3 space-y-2">
            {sessions.map((session) => (
              <button
                key={session._id}
                className={`w-full rounded-xl border px-3 py-3 text-left text-sm ${
                  selectedSession?._id === session._id
                    ? 'border-jade bg-jade/10 text-ink'
                    : 'border-black/10 bg-white text-black/65'
                }`}
                type="button"
                onClick={() => setSelectedId(session._id)}
              >
                <span className="block font-black">{session.title}</span>
                <span className="mt-1 block text-xs">
                  {statusLabels[session.status as StatusAction] || session.status}
                </span>
              </button>
            ))}
            {!sessions.length ? (
              <p className="rounded-xl bg-black/[0.03] p-4 text-sm text-black/55">
                Crea tu primer live para empezar.
              </p>
            ) : null}
          </div>
        </aside>

        {selectedSession ? (
          <div className="space-y-4">
            <section className="surface rounded-2xl p-5">
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                <div>
                  <p className="text-xs font-black uppercase tracking-wide text-jade">
                    Link publico
                  </p>
                  <h2 className="mt-1 text-2xl font-black text-ink">
                    {selectedSession.title}
                  </h2>
                  <p className="mt-2 rounded-xl bg-black/[0.03] px-3 py-2 text-xs text-black/58 [overflow-wrap:anywhere]">
                    {publicUrl || 'Creando enlace...'}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button className="btn-secondary" type="button" onClick={() => void copyPublicLink()}>
                    Copiar link
                  </button>
                  {selectedSession.status === 'ended' ? (
                    <span className="btn-secondary pointer-events-none opacity-60">
                      Live cerrado
                    </span>
                  ) : (
                    <Link className="btn-primary" href={`/live/${business?.slug}/${selectedSession.slug}`}>
                      Ver pagina
                    </Link>
                  )}
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button className="btn-secondary" disabled={isSaving || selectedSession.status === 'active'} type="button" onClick={() => void updateSessionStatus('active')}>
                  Activar
                </button>
                <button className="btn-secondary" disabled={isSaving || selectedSession.status === 'ended'} type="button" onClick={() => void updateSessionStatus('ended')}>
                  Finalizar
                </button>
                <span className="rounded-xl bg-black/[0.04] px-3 py-2 text-sm font-black text-black/55">
                  Estado: {statusLabels[selectedSession.status as StatusAction] || selectedSession.status}
                </span>
              </div>
            </section>

            <section className="space-y-4">
              <div className="surface rounded-2xl p-4">
                <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                  <div>
                    <p className="text-xs font-black uppercase tracking-wide text-jade">
                      Consola tactil
                    </p>
                    <h2 className="mt-1 text-2xl font-black text-ink">
                      Productos listos para mostrar
                    </h2>
                    <p className="mt-1 text-sm text-black/55">
                      Toca un producto para ponerlo en la pagina publica del live.
                    </p>
                  </div>
                  <button
                    className="btn-secondary justify-center"
                    disabled={isSaving || !availableProducts.length}
                    type="button"
                    onClick={() => void syncCatalog()}
                  >
                    {availableProducts.length
                      ? `Sincronizar ${availableProducts.length}`
                      : 'Catalogo completo'}
                  </button>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
                {selectedSession.items.map((item) => {
                  const product = item.product;
                  const stock = item.stockOverride ?? product?.stock ?? 0;
                  const isLiveEnded = selectedSession.status === 'ended';
                  return (
                    <article
                      key={item.productId}
                      className={`overflow-hidden rounded-2xl border bg-white shadow-soft transition ${
                        item.isCurrent ? 'border-jade ring-2 ring-jade/25' : 'border-black/10'
                      }`}
                    >
                      <div className="relative aspect-[4/3] bg-gradient-to-br from-jade/15 via-maize/20 to-clay/15">
                        {product?.images?.[0] ? (
                          <div
                            aria-hidden="true"
                            className="h-full w-full bg-cover bg-center"
                            style={{ backgroundImage: `url(${product.images[0]})` }}
                          />
                        ) : null}
                        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                          <span className="rounded-full bg-ink px-3 py-1 text-xs font-black text-white">
                            {item.code}
                          </span>
                          {item.isCurrent ? (
                            <span className="rounded-full bg-jade px-3 py-1 text-xs font-black text-white">
                              En pantalla
                            </span>
                          ) : null}
                          {item.status === 'sold_out' ? (
                            <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-black text-red-700">
                              Agotado
                            </span>
                          ) : null}
                        </div>
                      </div>
                      <div className="space-y-4 p-4">
                        <div className="min-w-0">
                        <h3 className="line-clamp-2 min-h-14 text-lg font-black leading-tight text-ink">
                          {product?.name || 'Producto'}
                        </h3>
                        <p className="mt-2 text-2xl font-black text-jade">
                          {money(product?.price)}
                        </p>
                        <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                          <span className="rounded-xl bg-black/[0.04] px-3 py-2 font-black text-black/58">
                            Stock {stock}
                          </span>
                          <span className="rounded-xl bg-black/[0.04] px-3 py-2 font-black text-black/58">
                            {product?.category || 'Catalogo'}
                          </span>
                        </div>
                      </div>
                        <button
                          className="btn-primary min-h-12 w-full justify-center"
                          disabled={isSaving || item.status === 'sold_out' || isLiveEnded}
                          type="button"
                          onClick={() => void showNow(item.productId)}
                        >
                          {isLiveEnded
                            ? 'Live cerrado'
                            : item.isCurrent
                              ? 'Mostrando ahora'
                              : 'Mostrar'}
                        </button>
                        <div className="grid grid-cols-3 gap-2">
                          <button className="btn-secondary justify-center px-2" disabled={isSaving} type="button" onClick={() => void updateItem(item.productId, { stockOverride: Math.max(0, stock - 1) })}>
                            -1
                          </button>
                          <button className="btn-secondary justify-center px-2" disabled={isSaving} type="button" onClick={() => void updateItem(item.productId, { stockOverride: stock + 1, status: 'available' })}>
                            +1
                          </button>
                          <button className="btn-secondary justify-center px-2 text-xs" disabled={isSaving} type="button" onClick={() => void updateItem(item.productId, { status: 'sold_out', stockOverride: 0 })}>
                            Agotar
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
                {!selectedSession.items.length ? (
                  <div className="surface rounded-2xl p-6 text-center text-black/58 md:col-span-2 2xl:col-span-3">
                    <p className="font-black text-ink">No hay productos en este live.</p>
                    <button
                      className="btn-primary mt-4 justify-center"
                      disabled={isSaving || !availableProducts.length}
                      type="button"
                      onClick={() => void syncCatalog()}
                    >
                      Cargar catalogo
                    </button>
                  </div>
                ) : null}
              </div>
            </section>

            <section className="surface rounded-2xl p-5">
              <h2 className="text-xl font-black text-ink">Solicitudes recibidas</h2>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {leads.map((lead) => (
                  <article key={lead._id} className="rounded-xl border border-black/10 bg-black/[0.02] p-4">
                    <p className="font-black text-ink">
                      {lead.code} · {lead.productName}
                    </p>
                    <p className="mt-1 text-sm text-black/58">
                      {lead.customerName} · Cantidad {lead.quantity}
                      {lead.size ? ` · Talla ${lead.size}` : ''}
                    </p>
                    {lead.notes ? (
                      <p className="mt-2 text-sm text-black/55">{lead.notes}</p>
                    ) : null}
                  </article>
                ))}
                {!leads.length ? (
                  <p className="rounded-xl bg-black/[0.03] p-4 text-sm text-black/55">
                    Cuando alguien solicite por WhatsApp, quedara registrado aqui.
                  </p>
                ) : null}
              </div>
            </section>
          </div>
        ) : null}
      </section>
    </div>
  );
}
