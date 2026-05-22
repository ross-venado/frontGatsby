'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiFetch, money } from '@/lib/api';
import { getToken } from '@/lib/auth';
import type {
  RestaurantOrder,
  RestaurantOrderStatus,
  RestaurantTable,
} from '@/types/mercadito';

const statuses: RestaurantOrderStatus[] = [
  'new',
  'preparing',
  'ready',
  'delivered',
  'waiting_payment',
  'paid',
  'cancelled',
];

export function RestaurantOrdersManager() {
  const [orders, setOrders] = useState<RestaurantOrder[]>([]);
  const [filter, setFilter] = useState<RestaurantOrderStatus | ''>('');
  const [selected, setSelected] = useState<RestaurantOrder | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    const query = filter ? `?status=${filter}` : '';
    const data = await apiFetch<RestaurantOrder[]>(
      `/business/restaurant/orders${query}`,
      { token },
    );
    setOrders(data);
    setSelected((current) =>
      current ? data.find((order) => order._id === current._id) || null : null,
    );
  }, [filter]);

  useEffect(() => {
    void load().catch((err) =>
      setError(err instanceof Error ? err.message : 'No se pudieron cargar pedidos'),
    );
  }, [load]);

  async function updateStatus(id: string, status: RestaurantOrderStatus) {
    const token = getToken();
    if (!token) return;
    await apiFetch(`/business/restaurant/orders/${id}/status`, {
      method: 'PATCH',
      token,
      body: JSON.stringify({ status }),
    });
    await load();
  }

  async function remove(id: string) {
    const token = getToken();
    if (!token) return;
    await apiFetch(`/business/restaurant/orders/${id}`, {
      method: 'DELETE',
      token,
    });
    setSelected(null);
    await load();
  }

  const totals = useMemo(
    () => ({
      count: orders.length,
      amount: orders.reduce((sum, order) => sum + order.total, 0),
    }),
    [orders],
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <section className="surface rounded-lg p-5">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-jade">
              Restaurante
            </p>
            <h1 className="mt-1 text-2xl font-bold text-ink">Pedidos por mesa</h1>
          </div>
          <select
            className="field max-w-56"
            value={filter}
            onChange={(event) =>
              setFilter(event.target.value as RestaurantOrderStatus | '')
            }
          >
            <option value="">Todos los estados</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4 rounded-lg bg-black/[0.03] p-4 text-sm font-semibold text-black/65">
          {totals.count} pedidos · {money(totals.amount)}
        </div>

        {error ? <p className="mt-4 text-sm text-red-700">{error}</p> : null}

        <div className="mt-5 grid gap-3">
          {orders.map((order) => {
            const table =
              typeof order.tableId === 'object'
                ? (order.tableId as RestaurantTable)
                : null;
            return (
              <article
                key={order._id}
                className="rounded-lg border border-black/10 bg-white p-4"
              >
                <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                  <div>
                    <h2 className="font-bold text-ink">
                      Pedido #{order.orderNumber}
                    </h2>
                    <p className="mt-1 text-sm text-black/60">
                      {table?.name || 'Mesa'} · {order.items.length} items ·{' '}
                      {money(order.total)}
                    </p>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-jade">
                      {order.status}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button className="btn-secondary" onClick={() => setSelected(order)}>
                      Ver
                    </button>
                    <select
                      className="field w-44"
                      value={order.status}
                      onChange={(event) =>
                        void updateStatus(
                          order._id,
                          event.target.value as RestaurantOrderStatus,
                        )
                      }
                    >
                      {statuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <aside className="surface h-fit rounded-lg p-5">
        <h2 className="text-xl font-bold text-ink">Detalle</h2>
        {selected ? (
          <div className="mt-4 space-y-4">
            <div>
              <p className="text-sm font-semibold text-black/60">
                Pedido #{selected.orderNumber}
              </p>
              <p className="text-sm text-black/60">
                Cliente: {selected.customerName || 'Sin nombre'}
              </p>
              <p className="text-sm text-black/60">
                Telefono: {selected.customerPhone || 'Sin telefono'}
              </p>
              {selected.notes ? (
                <p className="mt-2 text-sm text-black/60">{selected.notes}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              {selected.items.map((item) => (
                <div
                  key={`${item.productId}-${item.name}`}
                  className="rounded-md bg-black/[0.03] p-3"
                >
                  <p className="font-semibold text-ink">
                    {item.quantity} x {item.name}
                  </p>
                  <p className="text-sm text-black/60">
                    {money(item.unitPrice)} · {money(item.subtotal)}
                  </p>
                  {item.notes ? (
                    <p className="mt-1 text-sm text-black/60">{item.notes}</p>
                  ) : null}
                </div>
              ))}
            </div>
            <p className="text-lg font-bold text-jade">
              Total {money(selected.total)}
            </p>
            <button className="btn-secondary" onClick={() => void remove(selected._id)}>
              Eliminar pedido
            </button>
          </div>
        ) : (
          <p className="mt-3 text-sm text-black/60">
            Selecciona un pedido para revisar productos, notas y total.
          </p>
        )}
      </aside>
    </div>
  );
}
