'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { apiFetch, money } from '@/lib/api';
import { getToken } from '@/lib/auth';
import type {
  Product,
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

const terminalStatuses: RestaurantOrderStatus[] = [
  'delivered',
  'paid',
  'cancelled',
];

const statusLabels: Record<RestaurantOrderStatus, string> = {
  new: 'Nuevo',
  preparing: 'Preparando',
  ready: 'Listo',
  delivered: 'Finalizado',
  waiting_payment: 'Esperando pago',
  paid: 'Pagado',
  cancelled: 'Cancelado',
};

type OrderView = 'active' | 'history';

export function RestaurantOrdersManager() {
  const [orders, setOrders] = useState<RestaurantOrder[]>([]);
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [filter, setFilter] = useState<RestaurantOrderStatus | ''>('');
  const [view, setView] = useState<OrderView>('active');
  const [selected, setSelected] = useState<RestaurantOrder | null>(null);
  const [tableId, setTableId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [manualItems, setManualItems] = useState<
    Array<{ productId: string; quantity: number; notes: string }>
  >([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    const [orderData, tableData, productData] = await Promise.all([
      apiFetch<RestaurantOrder[]>('/business/restaurant/orders', {
        token,
      }),
      apiFetch<RestaurantTable[]>('/business/restaurant/tables', { token }),
      apiFetch<Product[]>('/business/products', { token }),
    ]);

    setOrders(orderData);
    setTables(tableData);
    setProducts(productData.filter((product) => product.status === 'active'));
    setSelected((current) =>
      current
        ? orderData.find((order) => order._id === current._id) || null
        : null,
    );
  }, []);

  useEffect(() => {
    void load().catch((err) =>
      setError(err instanceof Error ? err.message : 'No se pudieron cargar pedidos'),
    );
  }, [load]);

  async function createOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setMessage('');
    const token = getToken();
    if (!token) return;

    const items = manualItems.filter((item) => item.productId && item.quantity > 0);
    if (!tableId) {
      setError('Selecciona la mesa del pedido.');
      return;
    }
    if (!items.length) {
      setError('Agrega al menos un producto al pedido.');
      return;
    }

    await apiFetch<RestaurantOrder>('/business/restaurant/orders', {
      method: 'POST',
      token,
      body: JSON.stringify({
        tableId,
        customerName: customerName || undefined,
        customerPhone: customerPhone || undefined,
        notes: notes || undefined,
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          notes: item.notes || undefined,
        })),
      }),
    });

    setTableId('');
    setCustomerName('');
    setCustomerPhone('');
    setNotes('');
    setManualItems([]);
    setMessage('Pedido creado para la mesa seleccionada.');
    await load();
  }

  function addManualItem(productId: string) {
    if (!productId) return;
    setManualItems((current) => {
      const existing = current.find((item) => item.productId === productId);
      if (existing) {
        return current.map((item) =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }

      return [...current, { productId, quantity: 1, notes: '' }];
    });
  }

  function updateManualItem(
    productId: string,
    patch: Partial<{ quantity: number; notes: string }>,
  ) {
    setManualItems((current) =>
      current.map((item) =>
        item.productId === productId ? { ...item, ...patch } : item,
      ),
    );
  }

  function removeManualItem(productId: string) {
    setManualItems((current) =>
      current.filter((item) => item.productId !== productId),
    );
  }

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

  const visibleOrders = useMemo(() => {
    return orders.filter((order) => {
      const isHistory = terminalStatuses.includes(order.status);
      const matchesView = view === 'history' ? isHistory : !isHistory;
      const matchesFilter = filter ? order.status === filter : true;
      return matchesView && matchesFilter;
    });
  }, [filter, orders, view]);

  const tableSummary = useMemo(
    () => ({
      total: tables.length,
      occupied: tables.filter((table) => table.status === 'occupied').length,
      waitingPayment: tables.filter((table) => table.status === 'waiting_payment')
        .length,
      free: tables.filter((table) => table.status === 'free').length,
    }),
    [tables],
  );

  const visibleTotals = useMemo(
    () => ({
      count: visibleOrders.length,
      amount: visibleOrders.reduce((sum, order) => sum + order.total, 0),
    }),
    [visibleOrders],
  );

  const manualTotal = useMemo(
    () =>
      manualItems.reduce((sum, item) => {
        const product = products.find((entry) => entry._id === item.productId);
        return sum + (product?.price || 0) * item.quantity;
      }, 0),
    [manualItems, products],
  );

  function getTableName(order: RestaurantOrder) {
    return typeof order.tableId === 'object'
      ? (order.tableId as RestaurantTable).name
      : 'Mesa sin cargar';
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
      <section className="space-y-5">
        <div className="surface rounded-lg p-5">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-jade">
              Restaurante
            </p>
            <h1 className="mt-1 text-2xl font-bold text-ink">
              Administracion de pedidos
            </h1>
            <p className="mt-2 text-sm text-black/60">
              Activos para operar hoy; pagados, cancelados o finalizados pasan a
              historial.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              className={view === 'active' ? 'btn-primary' : 'btn-secondary'}
              onClick={() => setView('active')}
            >
              Activos
            </button>
            <button
              className={view === 'history' ? 'btn-primary' : 'btn-secondary'}
              onClick={() => setView('history')}
            >
              Historial
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-4">
          <div className="rounded-lg bg-black/[0.03] p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-black/45">
              Mesas
            </p>
            <p className="mt-1 text-xl font-bold text-ink">{tableSummary.total}</p>
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
            <p className="mt-1 text-xl font-bold text-jade">{tableSummary.free}</p>
          </div>
        </div>
        </div>

        <div className="surface rounded-lg p-5">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
            <div>
              <h2 className="text-xl font-bold text-ink">
                {view === 'active' ? 'Pedidos activos' : 'Historial de pedidos'}
              </h2>
              <p className="mt-1 text-sm font-semibold text-black/60">
                {visibleTotals.count} pedidos · {money(visibleTotals.amount)}
              </p>
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
                  {statusLabels[status]}
                </option>
              ))}
            </select>
          </div>

        {error ? <p className="mt-4 text-sm text-red-700">{error}</p> : null}

        <div className="mt-5 grid gap-3">
          {visibleOrders.map((order) => {
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
                    <p className="mt-1 font-semibold text-ink">
                      Para {table?.name || 'mesa sin cargar'}
                    </p>
                    <p className="mt-1 text-sm text-black/60">
                      {order.items.length} items · {money(order.total)}
                    </p>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-jade">
                      {statusLabels[order.status]}
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
                          {statusLabels[status]}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </article>
            );
          })}
          {!visibleOrders.length ? (
            <div className="rounded-lg border border-dashed border-black/15 p-6 text-center">
              <p className="font-semibold text-ink">
                {view === 'active'
                  ? 'No hay pedidos activos'
                  : 'Todavia no hay historial'}
              </p>
              <p className="mt-1 text-sm text-black/60">
                Los pedidos pagados, cancelados o finalizados salen de activos.
              </p>
            </div>
          ) : null}
        </div>
        </div>
      </section>

      <aside className="space-y-5">
        <form className="surface rounded-lg p-5" onSubmit={createOrder}>
          <h2 className="text-xl font-bold text-ink">Nuevo pedido</h2>
          <p className="mt-1 text-sm text-black/60">
            Crea un pedido manual y asignalo a una mesa.
          </p>

          <div className="mt-4 space-y-3">
            <label className="block">
              <span className="text-sm font-medium">Mesa del pedido</span>
              <select
                className="field mt-1"
                value={tableId}
                onChange={(event) => setTableId(event.target.value)}
                required
              >
                <option value="">Seleccionar mesa</option>
                {tables
                  .filter((table) => table.active)
                  .map((table) => (
                    <option key={table._id} value={table._id}>
                      {table.name} · {table.status}
                    </option>
                  ))}
              </select>
            </label>

            <div>
              <span className="text-sm font-medium">Agregar producto</span>
              <select
                className="field mt-1"
                value=""
                onChange={(event) => addManualItem(event.target.value)}
              >
                <option value="">Seleccionar producto</option>
                {products.map((product) => (
                  <option key={product._id} value={product._id}>
                    {product.name} · {money(product.price)}
                  </option>
                ))}
              </select>
            </div>

            {manualItems.map((item) => {
              const product = products.find((entry) => entry._id === item.productId);
              return (
                <div key={item.productId} className="rounded-md bg-black/[0.03] p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-ink">
                        {product?.name || 'Producto'}
                      </p>
                      <p className="text-sm text-black/60">
                        {money(product?.price)} ·{' '}
                        {money((product?.price || 0) * item.quantity)}
                      </p>
                    </div>
                    <button
                      className="text-sm font-semibold text-red-700"
                      type="button"
                      onClick={() => removeManualItem(item.productId)}
                    >
                      Quitar
                    </button>
                  </div>
                  <div className="mt-3 grid grid-cols-[80px_1fr] gap-2">
                    <input
                      className="field"
                      min={1}
                      type="number"
                      value={item.quantity}
                      onChange={(event) =>
                        updateManualItem(item.productId, {
                          quantity: Number(event.target.value || 1),
                        })
                      }
                    />
                    <input
                      className="field"
                      value={item.notes}
                      onChange={(event) =>
                        updateManualItem(item.productId, {
                          notes: event.target.value,
                        })
                      }
                      placeholder="Notas"
                    />
                  </div>
                </div>
              );
            })}

            <input
              className="field"
              value={customerName}
              onChange={(event) => setCustomerName(event.target.value)}
              placeholder="Cliente opcional"
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
            <p className="font-bold text-jade">Total {money(manualTotal)}</p>
            {message ? <p className="text-sm text-jade">{message}</p> : null}
            <button className="btn-primary w-full">Crear pedido</button>
          </div>
        </form>

        <section className="surface h-fit rounded-lg p-5">
        <h2 className="text-xl font-bold text-ink">Detalle</h2>
        {selected ? (
          <div className="mt-4 space-y-4">
            <div>
              <p className="text-sm font-semibold text-black/60">
                Pedido #{selected.orderNumber}
              </p>
              <p className="mt-1 font-semibold text-ink">
                Para {getTableName(selected)}
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
        </section>
      </aside>
    </div>
  );
}
