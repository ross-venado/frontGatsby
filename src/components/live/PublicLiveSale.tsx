'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { BusinessShareKit } from '@/components/BusinessShareKit';
import { apiFetch, money, whatsappMessageUrl } from '@/lib/api';
import type { LiveSession, LiveSessionItem } from '@/types/mercadito';

type PublicLiveSaleProps = {
  initialSession: LiveSession;
  businessSlug: string;
  sessionSlug: string;
};

type RequestForm = {
  customerName: string;
  size: string;
  quantity: string;
  notes: string;
};

const emptyForm: RequestForm = {
  customerName: '',
  size: '',
  quantity: '1',
  notes: '',
};

function itemStock(item?: LiveSessionItem) {
  return item?.stockOverride ?? item?.product?.stock;
}

function itemIsSoldOut(item?: LiveSessionItem) {
  const stock = itemStock(item);
  return item?.status === 'sold_out' || stock === 0;
}

function productCodeId(code: string) {
  return `producto-${code.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
}

function businessInitials(name?: string) {
  return (name || 'Local')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

export function PublicLiveSale({
  businessSlug,
  initialSession,
  sessionSlug,
}: PublicLiveSaleProps) {
  const [session, setSession] = useState(initialSession);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [form, setForm] = useState<RequestForm>(emptyForm);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [siteOrigin, setSiteOrigin] = useState('');

  const business = session.business;
  const currentItem = useMemo(() => {
    return session.items.find((item) => item.productId === session.currentProductId);
  }, [session]);
  const selectedItem =
    (selectedProductId
      ? session.items.find((item) => item.productId === selectedProductId)
      : null) || currentItem;
  const historyItems = session.items.filter(
    (item) => item.wasShown && item.productId !== currentItem?.productId,
  );
  const publicUrl =
    siteOrigin && business ? `${siteOrigin}/live/${business.slug}/${session.slug}` : '';

  useEffect(() => {
    setSiteOrigin(window.location.origin);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      void apiFetch<LiveSession>(`/public/live/${businessSlug}/${sessionSlug}`)
        .then((nextSession) => {
          const currentChanged =
            nextSession.currentProductId &&
            nextSession.currentProductId !== session.currentProductId;
          setSession(nextSession);
          if (currentChanged) {
            setSelectedProductId('');
          }
        })
        .catch(() => undefined);
    }, 4000);

    return () => window.clearInterval(timer);
  }, [businessSlug, session.currentProductId, sessionSlug]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!business || !selectedItem?.product || isSubmitting) return;
    setError('');
    setIsSubmitting(true);

    const quantity = Math.max(1, Number(form.quantity || 1));
    const lines = [
      `Hola, soy ${form.customerName}. Quiero apartar el producto ${selectedItem.code} del live:`,
      `${selectedItem.product.name} - ${money(selectedItem.product.price)}`,
      '',
      form.size ? `Talla: ${form.size}` : '',
      `Cantidad: ${quantity}`,
      form.notes ? `Nota: ${form.notes}` : '',
    ].filter(Boolean);
    const whatsappHref = whatsappMessageUrl(
      business.whatsapp || business.phone,
      lines.join('\n'),
    );

    try {
      await apiFetch(`/public/live/${businessSlug}/${sessionSlug}/leads`, {
        method: 'POST',
        body: JSON.stringify({
          productId: selectedItem.productId,
          customerName: form.customerName,
          size: form.size || undefined,
          quantity,
          notes: form.notes || undefined,
        }),
      });

      const nextSession = await apiFetch<LiveSession>(
        `/public/live/${businessSlug}/${sessionSlug}`,
      );
      setSession(nextSession);
      setForm(emptyForm);

      if (whatsappHref) {
        window.open(whatsappHref, '_blank', 'noopener,noreferrer');
      } else {
        setError('Este negocio aun no tiene WhatsApp configurado.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo solicitar');
    } finally {
      setIsSubmitting(false);
    }
  }

  function selectItem(item: LiveSessionItem) {
    setSelectedProductId(item.productId);
    window.history.replaceState(null, '', `#${productCodeId(item.code)}`);
  }

  return (
    <main className="min-h-screen bg-[#f8f6f0] text-ink">
      <section className="relative isolate overflow-hidden bg-ink text-white">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-cover bg-center opacity-25"
          style={business?.coverUrl ? { backgroundImage: `url(${business.coverUrl})` } : undefined}
        />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(135deg,rgba(18,53,45,0.98),rgba(15,139,111,0.88),rgba(246,183,60,0.58))]" />
        <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
          <p className="text-xs font-black uppercase tracking-wide text-white/70">
            Venta en vivo
          </p>
          <h1 className="mt-2 max-w-4xl text-4xl font-black leading-tight sm:text-6xl">
            {session.title}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70 sm:text-base">
            {business?.name || 'Negocio local'} actualiza aqui el producto que
            esta mostrando en la transmision. Si entraste tarde, abajo queda el
            historial de productos vistos.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0 space-y-5">
          {currentItem?.product ? (
            <article className="overflow-hidden rounded-3xl border border-black/10 bg-white shadow-soft">
              <div className="grid gap-0 lg:grid-cols-[0.92fr_1.08fr]">
                <div className="min-h-72 bg-[linear-gradient(135deg,#eaf5ef,#fff7df)]">
                  {currentItem.product.images?.[0] ? (
                    <div
                      aria-hidden="true"
                      className="h-full min-h-72 bg-cover bg-center"
                      style={{ backgroundImage: `url(${currentItem.product.images[0]})` }}
                    />
                  ) : null}
                </div>
                <div className="p-5 sm:p-7">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-jade px-4 py-2 text-sm font-black text-white">
                      Codigo {currentItem.code}
                    </span>
                    <span className="rounded-full bg-ink px-4 py-2 text-sm font-black text-white">
                      En vivo ahora
                    </span>
                  </div>
                  <h2 className="mt-5 text-3xl font-black leading-tight sm:text-5xl">
                    {currentItem.product.name}
                  </h2>
                  <p className="mt-3 text-3xl font-black text-jade">
                    {money(currentItem.product.price)}
                  </p>
                  <p className="mt-4 max-w-2xl text-base leading-7 text-black/62">
                    {currentItem.product.description || 'Producto de la venta en vivo.'}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <span className="rounded-xl bg-black/[0.04] px-4 py-3 text-sm font-black text-black/65">
                      Stock: {itemStock(currentItem) ?? 'consultar'}
                    </span>
                    {itemIsSoldOut(currentItem) ? (
                      <span className="rounded-xl bg-red-100 px-4 py-3 text-sm font-black text-red-700">
                        Agotado
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            </article>
          ) : (
            <div className="overflow-hidden rounded-3xl border border-black/10 bg-white shadow-soft">
              <div className="bg-[linear-gradient(135deg,#12352d_0%,#0f8b6f_58%,#f6b73c_100%)] px-6 py-10 text-center text-white">
                <div className="mx-auto flex h-32 w-32 items-center justify-center overflow-hidden rounded-3xl border border-white/20 bg-white/15 shadow-2xl shadow-black/20">
                  {business?.logoUrl ? (
                    <span
                      aria-label={business.name}
                      className="block h-full w-full bg-cover bg-center"
                      role="img"
                      style={{ backgroundImage: `url(${business.logoUrl})` }}
                    />
                  ) : (
                    <span className="text-4xl font-black">
                      {businessInitials(business?.name)}
                    </span>
                  )}
                </div>
                <p className="mt-6 text-xs font-black uppercase tracking-wide text-white/70">
                  Live activo
                </p>
                <h2 className="mx-auto mt-2 max-w-2xl text-3xl font-black leading-tight sm:text-5xl">
                  Esperando producto en pantalla
                </h2>
                <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-white/75">
                  {business?.name || 'El negocio'} esta preparando el siguiente
                  producto. Mantente en esta pagina; se actualiza sola cuando lo
                  muestren.
                </p>
              </div>
              <p className="p-5 text-center text-sm font-bold text-black/52">
                Si entraste tarde, abajo veras el historial de productos que ya pasaron.
              </p>
            </div>
          )}

          {historyItems.length ? (
            <section className="rounded-3xl border border-black/10 bg-white p-5 shadow-soft">
              <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
                <div>
                  <p className="text-xs font-black uppercase tracking-wide text-jade">
                    Historial del live
                  </p>
                  <h2 className="mt-1 text-2xl font-black text-ink">
                    Productos que ya pasaron
                  </h2>
                </div>
                <p className="text-sm font-bold text-black/45">
                  {historyItems.length} vistos
                </p>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {historyItems.map((item) => (
                  <button
                    key={item.productId}
                    className="grid grid-cols-[82px_1fr] gap-3 rounded-2xl border border-black/10 bg-black/[0.02] p-3 text-left transition hover:border-jade"
                    id={productCodeId(item.code)}
                    type="button"
                    onClick={() => selectItem(item)}
                  >
                    <span className="h-20 overflow-hidden rounded-xl bg-[linear-gradient(135deg,#eaf5ef,#fff7df)]">
                      {item.product?.images?.[0] ? (
                        <span
                          aria-hidden="true"
                          className="block h-full bg-cover bg-center"
                          style={{ backgroundImage: `url(${item.product.images[0]})` }}
                        />
                      ) : null}
                    </span>
                    <span className="min-w-0">
                      <span className="rounded-full bg-ink px-2.5 py-1 text-xs font-black text-white">
                        {item.code}
                      </span>
                      <span className="mt-2 block truncate font-black text-ink">
                        {item.product?.name || 'Producto'}
                      </span>
                      <span className="mt-1 block text-sm font-black text-jade">
                        {money(item.product?.price)}
                      </span>
                      <span className="mt-1 block text-xs text-black/48">
                        Stock: {itemStock(item) ?? 'consultar'}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </section>
          ) : null}
        </div>

        <aside className="h-fit space-y-4 lg:sticky lg:top-5">
          <form className="rounded-3xl border border-black/10 bg-white p-5 shadow-soft" onSubmit={submit}>
            <p className="text-xs font-black uppercase tracking-wide text-jade">
              Solicitar producto
            </p>
            <h2 className="mt-1 text-2xl font-black text-ink">
              {selectedItem?.product ? `${selectedItem.code} · ${selectedItem.product.name}` : 'Producto'}
            </h2>
            <p className="mt-2 text-sm leading-6 text-black/58">
              Tu solicitud se registra y se abre WhatsApp con el mensaje listo.
            </p>
            <div className="mt-4 space-y-3">
              <input
                className="field"
                disabled={isSubmitting || itemIsSoldOut(selectedItem)}
                placeholder="Tu nombre"
                value={form.customerName}
                onChange={(event) => setForm({ ...form, customerName: event.target.value })}
                required
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  className="field"
                  disabled={isSubmitting || itemIsSoldOut(selectedItem)}
                  placeholder="Talla"
                  value={form.size}
                  onChange={(event) => setForm({ ...form, size: event.target.value })}
                />
                <input
                  className="field"
                  disabled={isSubmitting || itemIsSoldOut(selectedItem)}
                  min="1"
                  placeholder="Cantidad"
                  type="number"
                  value={form.quantity}
                  onChange={(event) => setForm({ ...form, quantity: event.target.value })}
                  required
                />
              </div>
              <textarea
                className="field min-h-24"
                disabled={isSubmitting || itemIsSoldOut(selectedItem)}
                placeholder="Nota opcional"
                value={form.notes}
                onChange={(event) => setForm({ ...form, notes: event.target.value })}
              />
            </div>
            <button
              className="btn-primary mt-4 min-h-12 w-full justify-center disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSubmitting || !selectedItem?.product || itemIsSoldOut(selectedItem)}
            >
              {itemIsSoldOut(selectedItem)
                ? 'Producto agotado'
                : isSubmitting
                  ? 'Abriendo WhatsApp...'
                  : 'Solicitar por WhatsApp'}
            </button>
            {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
          </form>

          {business && publicUrl ? (
            <BusinessShareKit
              businessName={`${business.name} - ${session.title}`}
              publicUrl={publicUrl}
              whatsapp={business.whatsapp || business.phone}
            />
          ) : null}
        </aside>
      </section>
    </main>
  );
}
