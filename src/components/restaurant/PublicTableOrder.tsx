'use client';

import { FormEvent, useMemo, useState } from 'react';
import { apiFetch, money } from '@/lib/api';
import type {
  Product,
  PublicRestaurantTablePayload,
  RestaurantOrder,
} from '@/types/mercadito';

type CartItem = {
  product: Product;
  quantity: number;
  notes: string;
};

type PublicTableOrderProps = {
  payload: PublicRestaurantTablePayload;
};

export function PublicTableOrder({ payload }: PublicTableOrderProps) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [confirmation, setConfirmation] = useState<RestaurantOrder | null>(null);
  const [error, setError] = useState('');

  function add(product: Product) {
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
    setCart((current) =>
      current.map((item) =>
        item.product._id === productId ? { ...item, ...patch } : item,
      ),
    );
  }

  function remove(productId: string) {
    setCart((current) => current.filter((item) => item.product._id !== productId));
  }

  const total = useMemo(
    () => cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    [cart],
  );

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setConfirmation(null);

    if (!cart.length) {
      setError('Agrega al menos un producto.');
      return;
    }

    try {
      const order = await apiFetch<RestaurantOrder>(
        `/public/restaurants/${payload.business.slug}/tables/${payload.table.qrSlug}/orders`,
        {
          method: 'POST',
          body: JSON.stringify({
            customerName: customerName || undefined,
            customerPhone: customerPhone || undefined,
            notes: notes || undefined,
            items: cart.map((item) => ({
              productId: item.product._id,
              quantity: item.quantity,
              notes: item.notes || undefined,
            })),
          }),
        },
      );
      setConfirmation(order);
      setCart([]);
      setNotes('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo enviar el pedido');
    }
  }

  return (
    <main className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[1fr_380px]">
      <section>
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-jade">
            Menu QR
          </p>
          <h1 className="mt-1 text-3xl font-bold text-ink">
            {payload.business.name}
          </h1>
          <p className="mt-2 text-black/60">
            {payload.table.name} · pide desde tu mesa
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {payload.products.map((product) => (
            <article key={product._id} className="surface rounded-lg p-4">
              <h2 className="font-bold text-ink">{product.name}</h2>
              <p className="mt-2 text-sm text-black/60">
                {product.description || product.category || 'Producto del menu'}
              </p>
              <div className="mt-4 flex items-center justify-between gap-3">
                <p className="font-bold text-jade">{money(product.price)}</p>
                <button className="btn-primary" onClick={() => add(product)}>
                  Agregar
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <aside className="surface h-fit rounded-lg p-5">
        <h2 className="text-xl font-bold text-ink">Tu pedido</h2>
        <form className="mt-4 space-y-4" onSubmit={submit}>
          <div className="space-y-3">
            {cart.map((item) => (
              <div key={item.product._id} className="rounded-md bg-black/[0.03] p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-ink">{item.product.name}</p>
                    <p className="text-sm text-black/60">{money(item.product.price)}</p>
                  </div>
                  <button
                    className="text-sm font-semibold text-red-700"
                    type="button"
                    onClick={() => remove(item.product._id)}
                  >
                    Quitar
                  </button>
                </div>
                <div className="mt-3 grid grid-cols-[90px_1fr] gap-2">
                  <input
                    className="field"
                    min={1}
                    type="number"
                    value={item.quantity}
                    onChange={(event) =>
                      updateItem(item.product._id, {
                        quantity: Number(event.target.value || 1),
                      })
                    }
                  />
                  <input
                    className="field"
                    value={item.notes}
                    onChange={(event) =>
                      updateItem(item.product._id, { notes: event.target.value })
                    }
                    placeholder="Notas"
                  />
                </div>
              </div>
            ))}
          </div>

          <input
            className="field"
            value={customerName}
            onChange={(event) => setCustomerName(event.target.value)}
            placeholder="Nombre opcional"
          />
          <input
            className="field"
            value={customerPhone}
            onChange={(event) => setCustomerPhone(event.target.value)}
            placeholder="Telefono opcional"
          />
          <textarea
            className="field min-h-20"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Notas generales"
          />
          <p className="text-lg font-bold text-jade">Total {money(total)}</p>
          {error ? <p className="text-sm text-red-700">{error}</p> : null}
          {confirmation ? (
            <p className="rounded-md bg-jade/10 p-3 text-sm font-semibold text-jade">
              Pedido #{confirmation.orderNumber} enviado.
            </p>
          ) : null}
          <button className="btn-primary w-full">Enviar pedido</button>
        </form>
      </aside>
    </main>
  );
}
