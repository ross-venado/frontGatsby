'use client';

import { useEffect, useMemo, useState } from 'react';
import { EmptyState } from '@/components/EmptyState';
import { money, trackPublicBusinessEvent, whatsappMessageUrl } from '@/lib/api';
import type { Business, Product } from '@/types/mercadito';

type CartItem = {
  product: Product;
  quantity: number;
  notes: string;
};

type BusinessWhatsAppOrderProps = {
  business: Business;
  products: Product[];
  publicUrl: string;
};

const PAGE_SIZE = 9;

export function BusinessWhatsAppOrder({
  business,
  products,
  publicUrl,
}: BusinessWhatsAppOrderProps) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [page, setPage] = useState(1);
  const [sent, setSent] = useState(false);
  const [viewedProductIds, setViewedProductIds] = useState<Set<string>>(new Set());

  const businessPhone = business.whatsapp || business.phone;

  function add(product: Product) {
    if (product.status === 'sold_out') {
      return;
    }

    setSent(false);
    trackPublicBusinessEvent(business.slug, 'order_started', {
      productId: product._id,
      productSlug: product.slug,
      productName: product.name,
    });
    setCart((current) => {
      const existing = current.find((item) => item.product._id === product._id);

      if (existing) {
        return current.map((item) =>
          item.product._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }

      return [...current, { product, quantity: 1, notes: '' }];
    });
  }

  function trackProductView(product: Product) {
    if (viewedProductIds.has(product._id)) {
      return;
    }

    setViewedProductIds((current) => new Set(current).add(product._id));
    trackPublicBusinessEvent(business.slug, 'product_view', {
      productId: product._id,
      productSlug: product.slug,
      productName: product.name,
      category: product.category,
    });
  }

  function updateItem(productId: string, patch: Partial<CartItem>) {
    setSent(false);
    setCart((current) =>
      current.map((item) =>
        item.product._id === productId ? { ...item, ...patch } : item,
      ),
    );
  }

  function remove(productId: string) {
    setSent(false);
    setCart((current) => current.filter((item) => item.product._id !== productId));
  }

  function resetOrder() {
    setCart([]);
    setCustomerName('');
    setCustomerPhone('');
    setNotes('');
    setSent(false);
  }

  const total = useMemo(
    () => cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    [cart],
  );

  const cartUnits = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart],
  );

  const categoryOptions = useMemo(() => {
    const values = products
      .map((product) => product.category?.trim())
      .filter((value): value is string => Boolean(value));

    return Array.from(new Set(values))
      .sort((a, b) => a.localeCompare(b))
      .map((name) => ({
        name,
        count: products.filter((product) => product.category === name).length,
      }));
  }, [products]);

  const visibleProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesCategory = category === 'all' || product.category === category;
      const matchesQuery = query
        ? [product.name, product.description, product.category]
            .filter(Boolean)
            .some((value) => value?.toLowerCase().includes(query))
        : true;

      return matchesCategory && matchesQuery;
    });
  }, [category, products, search]);

  const totalPages = Math.max(1, Math.ceil(visibleProducts.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedProducts = visibleProducts.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  useEffect(() => {
    setPage(1);
  }, [category, search]);

  const message = useMemo(() => {
    if (!cart.length) {
      return '';
    }

    const items = cart
      .map((item) => {
        const subtotal = item.product.price * item.quantity;
        const base = `- ${item.quantity} x ${item.product.name} (${money(item.product.price)}) = ${money(subtotal)}`;
        return item.notes ? `${base}\n  Nota: ${item.notes}` : base;
      })
      .join('\n');

    const details = [
      `Hola, quiero hacer un pedido en ${business.name}:`,
      '',
      items,
      '',
      `Total estimado: ${money(total)}`,
      customerName ? `Cliente: ${customerName}` : '',
      customerPhone ? `Telefono: ${customerPhone}` : '',
      notes ? `Notas generales: ${notes}` : '',
      `Local: ${publicUrl}`,
      '',
      'Por favor confirmame disponibilidad y tiempo de entrega.',
    ].filter(Boolean);

    return details.join('\n');
  }, [business.name, cart, customerName, customerPhone, notes, publicUrl, total]);

  const whatsappOrderUrl = whatsappMessageUrl(businessPhone, message);
  const canSend = Boolean(cart.length && whatsappOrderUrl);

  return (
    <section id="pedido" className="grid gap-6 pb-20 lg:grid-cols-[minmax(0,1fr)_380px] lg:pb-0">
      <div>
        <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-soft sm:p-5">
          <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-jade">
                Catalogo del negocio
              </p>
              <h2 className="mt-1 text-2xl font-black text-ink sm:text-3xl">
                Menu y productos
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-black/60">
                Explora por categoria, agrega productos y manda el pedido armado por WhatsApp.
              </p>
            </div>
            <div className="grid grid-cols-2 overflow-hidden rounded-xl border border-black/10 bg-black/[0.03] text-center sm:w-72">
              <div className="p-3">
                <p className="text-lg font-black text-ink">{products.length}</p>
                <p className="text-xs font-semibold text-black/50">productos</p>
              </div>
              <div className="border-l border-black/10 p-3">
                <p className="text-lg font-black text-ink">{categoryOptions.length || 1}</p>
                <p className="text-xs font-semibold text-black/50">categorias</p>
              </div>
            </div>
          </div>

          {products.length ? (
            <div className="mt-5 space-y-4">
              <input
                className="field min-h-11"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar producto, bebida o categoria"
              />
              <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
                <button
                  className={`shrink-0 rounded-full border px-4 py-2 text-sm font-bold transition ${
                    category === 'all'
                      ? 'border-jade bg-jade text-white'
                      : 'border-black/10 bg-white text-ink hover:border-jade/40'
                  }`}
                  type="button"
                  onClick={() => setCategory('all')}
                >
                  Todo · {products.length}
                </button>
                {categoryOptions.map((item) => (
                  <button
                    key={item.name}
                    className={`shrink-0 rounded-full border px-4 py-2 text-sm font-bold transition ${
                      category === item.name
                        ? 'border-jade bg-jade text-white'
                        : 'border-black/10 bg-white text-ink hover:border-jade/40'
                    }`}
                    type="button"
                    onClick={() => setCategory(item.name)}
                  >
                    {item.name} · {item.count}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {products.length ? (
            pagedProducts.length ? (
              pagedProducts.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  onAdd={add}
                  onView={trackProductView}
                />
              ))
            ) : (
              <div className="md:col-span-2 xl:col-span-3">
                <EmptyState
                  title="Sin resultados"
                  description="Cambia la busqueda o la categoria para ver mas productos."
                />
              </div>
            )
          ) : (
            <EmptyState
              title="Sin productos publicados"
              description="Este negocio aun no ha activado productos."
            />
          )}
        </div>

        {visibleProducts.length > PAGE_SIZE ? (
          <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-black/10 bg-white p-4 shadow-soft sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-semibold text-black/60">
              Mostrando {(currentPage - 1) * PAGE_SIZE + 1}-
              {Math.min(currentPage * PAGE_SIZE, visibleProducts.length)} de{' '}
              {visibleProducts.length}
            </p>
            <div className="grid grid-cols-2 gap-2 sm:flex">
              <button
                className="btn-secondary justify-center disabled:opacity-45"
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setPage((value) => Math.max(1, value - 1))}
              >
                Anterior
              </button>
              <button
                className="btn-primary justify-center disabled:opacity-45"
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
              >
                Ver mas
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <aside id="resumen-pedido" className="surface h-fit rounded-2xl p-5 lg:sticky lg:top-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-ink">Tu pedido</h2>
            <p className="mt-1 text-sm text-black/55">
              El negocio confirma disponibilidad por WhatsApp.
            </p>
          </div>
          <span className="rounded-full bg-jade/10 px-3 py-1 text-sm font-bold text-jade">
            {cartUnits}
          </span>
        </div>

        {sent ? (
          <div className="mt-4 rounded-lg border border-jade/20 bg-jade/10 p-4">
            <p className="font-bold text-jade">Pedido enviado a WhatsApp</p>
            <p className="mt-1 text-sm text-black/60">
              Cuando termines con este pedido puedes limpiar el carrito y armar otro.
            </p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
              <button className="btn-primary justify-center" type="button" onClick={resetOrder}>
                Pedir otro
              </button>
              <button
                className="btn-secondary justify-center"
                type="button"
                onClick={() => setSent(false)}
              >
                Editar pedido
              </button>
            </div>
          </div>
        ) : null}

        <div className="mt-4 max-h-[360px] space-y-3 overflow-y-auto pr-1">
          {cart.length ? (
            cart.map((item) => (
              <div key={item.product._id} className="rounded-lg bg-black/[0.03] p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-ink">{item.product.name}</p>
                    <p className="text-sm text-black/60">
                      {money(item.product.price)} · {money(item.product.price * item.quantity)}
                    </p>
                  </div>
                  <button
                    className="text-sm font-semibold text-red-700"
                    type="button"
                    onClick={() => remove(item.product._id)}
                  >
                    Quitar
                  </button>
                </div>
                <div className="mt-3 grid gap-2 min-[420px]:grid-cols-[84px_1fr]">
                  <input
                    className="field"
                    min={1}
                    type="number"
                    value={item.quantity}
                    onChange={(event) =>
                      updateItem(item.product._id, {
                        quantity: Math.max(1, Number(event.target.value || 1)),
                      })
                    }
                  />
                  <input
                    className="field"
                    value={item.notes}
                    onChange={(event) =>
                      updateItem(item.product._id, { notes: event.target.value })
                    }
                    placeholder="Notas del producto"
                  />
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-lg border border-dashed border-black/15 p-4 text-sm text-black/55">
              Agrega productos para generar el mensaje de pedido.
            </div>
          )}
        </div>

        <div className="mt-4 space-y-3">
          <input
            className="field"
            value={customerName}
            onChange={(event) => {
              setSent(false);
              setCustomerName(event.target.value);
            }}
            placeholder="Nombre opcional"
          />
          <input
            className="field"
            value={customerPhone}
            onChange={(event) => {
              setSent(false);
              setCustomerPhone(event.target.value);
            }}
            placeholder="Telefono opcional"
          />
          <textarea
            className="field min-h-20"
            value={notes}
            onChange={(event) => {
              setSent(false);
              setNotes(event.target.value);
            }}
            placeholder="Notas generales"
          />
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-black/10 pt-4">
          <span className="text-sm font-semibold text-black/55">Total estimado</span>
          <span className="text-lg font-bold text-jade">{money(total)}</span>
        </div>

        {canSend ? (
          <a
            className="btn-primary mt-4 w-full justify-center"
            href={whatsappOrderUrl || '#'}
            target="_blank"
            onClick={() => {
              setSent(true);
              trackPublicBusinessEvent(business.slug, 'whatsapp_click', {
                source: 'order_cart',
                items: cartUnits,
                total,
              });
            }}
          >
            Enviar por WhatsApp
          </a>
        ) : (
          <button className="btn-primary mt-4 w-full opacity-50" type="button" disabled>
            Enviar por WhatsApp
          </button>
        )}

        {!businessPhone ? (
          <p className="mt-3 text-sm text-red-700">
            Este negocio aun no tiene WhatsApp configurado.
          </p>
        ) : null}
      </aside>

      {cart.length ? (
        <div className="fixed inset-x-3 bottom-3 z-30 rounded-2xl border border-black/10 bg-ink p-3 text-white shadow-2xl shadow-black/30 lg:hidden">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white/60">Tu pedido</p>
              <p className="truncate text-sm font-black">
                {cartUnits} productos · {money(total)}
              </p>
            </div>
            <a
              className="shrink-0 rounded-xl bg-jade px-4 py-3 text-sm font-black text-white"
              href="#resumen-pedido"
            >
              Ver carrito
            </a>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function ProductCard({
  product,
  onAdd,
  onView,
}: {
  product: Product;
  onAdd: (product: Product) => void;
  onView: (product: Product) => void;
}) {
  const isSoldOut = product.status === 'sold_out';

  return (
    <article className="group overflow-hidden rounded-2xl border border-black/10 bg-white shadow-soft transition hover:-translate-y-0.5 hover:border-jade/35">
      <div className="relative h-36 overflow-hidden bg-gradient-to-br from-jade/20 via-maize/25 to-clay/15">
        {product.images?.[0] ? (
          <div
            aria-hidden="true"
            className="h-full w-full bg-cover bg-center transition duration-300 group-hover:scale-105"
            style={{ backgroundImage: `url(${product.images[0]})` }}
          />
        ) : (
          <div className="flex h-full items-center justify-center px-6 text-center">
            <span className="text-xs font-black uppercase tracking-wide text-jade">
              {product.category || 'Producto local'}
            </span>
          </div>
        )}
        {product.category ? (
          <span className="absolute left-3 top-3 max-w-[calc(100%-1.5rem)] truncate rounded-full bg-white/90 px-3 py-1 text-[11px] font-black uppercase text-jade shadow-sm">
            {product.category}
          </span>
        ) : null}
      </div>
      <div className="flex min-h-60 flex-col p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="line-clamp-2 text-base font-black text-ink">
            {product.name}
          </h3>
          <p className="shrink-0 rounded-full bg-jade/10 px-3 py-1 text-sm font-black text-jade">
            {money(product.price)}
          </p>
        </div>
        <p className="mt-3 line-clamp-2 text-sm leading-6 text-black/60">
          {product.description || 'Producto disponible en este local.'}
        </p>
        <ProductDetails product={product} onView={() => onView(product)} />
        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
          <span
            className={`rounded-full px-3 py-1 text-xs font-bold ${
              isSoldOut
                ? 'bg-red-50 text-red-700'
                : 'bg-black/[0.04] text-black/55'
            }`}
          >
            {isSoldOut ? 'Agotado' : 'Disponible'}
          </span>
          <button
            className="btn-primary min-h-11 px-5 disabled:cursor-not-allowed disabled:opacity-45"
            type="button"
            disabled={isSoldOut}
            onClick={() => onAdd(product)}
          >
            Agregar
          </button>
        </div>
      </div>
    </article>
  );
}

function ProductDetails({
  product,
  onView,
}: {
  product: Product;
  onView: () => void;
}) {
  const attributes = product.attributes
    ? Object.entries(product.attributes).filter(([, value]) => value !== undefined && value !== null && value !== '')
    : [];

  return (
    <details
      className="mt-3 rounded-md border border-black/10 bg-white/70"
      onToggle={(event) => {
        if (event.currentTarget.open) {
          onView();
        }
      }}
    >
      <summary className="cursor-pointer list-none px-3 py-2 text-sm font-semibold text-ink">
        Ver detalles
      </summary>
      <div className="space-y-3 border-t border-black/10 px-3 py-3 text-sm text-black/65">
        {product.description ? <p>{product.description}</p> : null}
        <div className="grid gap-2">
          {product.category ? (
            <DetailRow label="Categoria" value={product.category} />
          ) : null}
          {product.stock !== undefined ? (
            <DetailRow label="Stock" value={String(product.stock)} />
          ) : null}
          <DetailRow label="Estado" value={product.status} />
        </div>
        {attributes.length ? (
          <div className="rounded-md bg-black/[0.03] p-3">
            <p className="font-semibold text-ink">Mas informacion</p>
            <div className="mt-2 grid gap-1">
              {attributes.map(([key, value]) => (
                <DetailRow key={key} label={key} value={String(value)} />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </details>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-black/45">{label}</span>
      <span className="text-right font-medium text-ink">{value}</span>
    </div>
  );
}
