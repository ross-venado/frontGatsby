'use client';

import { useMemo, useState } from 'react';
import { EmptyState } from '@/components/EmptyState';
import { money, whatsappMessageUrl } from '@/lib/api';
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
  const [sent, setSent] = useState(false);

  const businessPhone = business.whatsapp || business.phone;

  function add(product: Product) {
    setSent(false);
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

  const categories = useMemo(() => {
    const values = products
      .map((product) => product.category?.trim())
      .filter((value): value is string => Boolean(value));

    return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b));
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
    <section id="pedido" className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
      <div>
        <div className="flex flex-col justify-between gap-3 xl:flex-row xl:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-jade">
              Pedido por WhatsApp
            </p>
            <h2 className="mt-1 text-2xl font-bold text-ink">Productos</h2>
          </div>
          <p className="max-w-md text-sm text-black/55">
            Arma tu pedido y envialo con cantidades, notas y total estimado.
          </p>
        </div>

        {products.length ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_220px]">
            <input
              className="field"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar producto"
            />
            <select
              className="field"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              <option value="all">Todas las categorias</option>
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3 lg:max-h-[720px] lg:overflow-y-auto lg:pr-2">
          {products.length ? (
            visibleProducts.length ? (
              visibleProducts.map((product) => (
                <article
                  key={product._id}
                  className="surface flex overflow-hidden rounded-lg sm:flex-col"
                >
                  <div className="h-auto w-28 shrink-0 bg-gradient-to-br from-jade/15 via-maize/20 to-clay/15 sm:h-36 sm:w-full">
                    {product.images?.[0] ? (
                      <div
                        aria-hidden="true"
                        className="h-full w-full bg-cover bg-center"
                        style={{ backgroundImage: `url(${product.images[0]})` }}
                      />
                    ) : null}
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col p-4">
                    <h3 className="line-clamp-2 font-semibold text-ink">
                      {product.name}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm text-black/60">
                      {product.description || product.category || 'Producto del local'}
                    </p>
                    <div className="mt-auto flex flex-col gap-3 pt-4 min-[420px]:flex-row min-[420px]:items-center min-[420px]:justify-between">
                      <p className="font-bold text-jade">{money(product.price)}</p>
                      <button
                        className="btn-primary w-full min-[420px]:w-auto"
                        type="button"
                        onClick={() => add(product)}
                      >
                        Agregar
                      </button>
                    </div>
                  </div>
                </article>
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
      </div>

      <aside className="surface h-fit rounded-lg p-5 lg:sticky lg:top-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-ink">Tu pedido</h2>
            <p className="mt-1 text-sm text-black/55">
              El negocio confirma disponibilidad por WhatsApp.
            </p>
          </div>
          <span className="rounded-full bg-jade/10 px-3 py-1 text-sm font-bold text-jade">
            {cart.length}
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
            onClick={() => setSent(true)}
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
    </section>
  );
}
