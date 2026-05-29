'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { AuthGuard } from '@/components/AuthGuard';
import { DashboardLayout } from '@/components/DashboardLayout';
import { ImageUrlField } from '@/components/ImageUrlField';
import { apiFetch, money } from '@/lib/api';
import { getToken } from '@/lib/auth';
import type {
  Business,
  BusinessCategory,
  Product,
  RestaurantOrder,
  Service,
} from '@/types/mercadito';

type AnalyticsRow = {
  _id: string;
  count: number;
};

type DashboardData = {
  products: Product[];
  services: Service[];
  analytics: AnalyticsRow[];
  orders: RestaurantOrder[];
};

const emptyDashboardData: DashboardData = {
  products: [],
  services: [],
  analytics: [],
  orders: [],
};

export default function DashboardPage() {
  const [business, setBusiness] = useState<Business | null>(null);
  const [categories, setCategories] = useState<BusinessCategory[]>([]);
  const [dashboardData, setDashboardData] = useState<DashboardData>(emptyDashboardData);
  const [message, setMessage] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    async function loadDashboard() {
      if (!token) return;
      setLoading(true);

      const [businessData, categoryData] = await Promise.all([
        apiFetch<Business>('/business/me', { token }),
        apiFetch<BusinessCategory[]>('/public/categories').catch(() => []),
      ]);

      setBusiness(businessData);
      setLogoUrl(businessData.logoUrl || '');
      setCoverUrl(businessData.coverUrl || '');
      setCategories(categoryData);

      const [products, services, analytics, orders] = await Promise.all([
        apiFetch<Product[]>('/business/products', { token }).catch(() => []),
        apiFetch<Service[]>('/business/services', { token }).catch(() => []),
        apiFetch<AnalyticsRow[]>('/business/analytics/summary', { token }).catch(() => []),
        businessData.modules?.includes('restaurant')
          ? apiFetch<RestaurantOrder[]>('/business/restaurant/orders', { token }).catch(() => [])
          : Promise.resolve([]),
      ]);

      setDashboardData({ products, services, analytics, orders });
      setLoading(false);
    }

    void loadDashboard().catch(() => {
      setBusiness(null);
      setDashboardData(emptyDashboardData);
      setLoading(false);
    });
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

  const activeProducts = useMemo(
    () => dashboardData.products.filter((product) => product.status === 'active'),
    [dashboardData.products],
  );

  const soldOutProducts = useMemo(
    () => dashboardData.products.filter((product) => product.status === 'sold_out'),
    [dashboardData.products],
  );

  const activeOrders = useMemo(
    () =>
      dashboardData.orders.filter(
        (order) => !['paid', 'cancelled', 'delivered'].includes(order.status),
      ),
    [dashboardData.orders],
  );

  const orderAmount = useMemo(
    () => activeOrders.reduce((sum, order) => sum + order.total, 0),
    [activeOrders],
  );

  const analyticsMap = useMemo(() => {
    return dashboardData.analytics.reduce<Record<string, number>>((summary, row) => {
      summary[row._id] = row.count;
      return summary;
    }, {});
  }, [dashboardData.analytics]);

  const profileScore = useMemo(() => {
    const checks = [
      business?.name,
      business?.description,
      business?.whatsapp || business?.phone,
      business?.address,
      business?.logoUrl,
      business?.coverUrl,
      activeProducts.length || dashboardData.services.length,
    ];

    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [activeProducts.length, business, dashboardData.services.length]);

  const topProducts = useMemo(() => {
    return [...activeProducts]
      .sort((first, second) => second.price - first.price)
      .slice(0, 4);
  }, [activeProducts]);

  const publicUrl = business ? `/businesses/${business.slug}` : '/businesses';

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="space-y-6">
          <section className="overflow-hidden rounded-3xl border border-black/10 bg-ink text-white shadow-soft">
            <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-jade">
                  Centro de control
                </p>
                <h1 className="mt-2 text-3xl font-black leading-tight sm:text-4xl">
                  {business?.name || 'Tu local digital'}
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-white/65">
                  Revisa el estado del catalogo, mantiene tus datos listos y entra rapido a las tareas que generan pedidos.
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Link className="rounded-xl bg-jade px-4 py-3 text-sm font-black text-white" href={publicUrl}>
                    Ver local
                  </Link>
                  <Link className="rounded-xl bg-white/10 px-4 py-3 text-sm font-black text-white hover:bg-white/15" href="/dashboard/products">
                    Agregar productos
                  </Link>
                  {business?.modules?.includes('restaurant') ? (
                    <Link className="rounded-xl bg-white/10 px-4 py-3 text-sm font-black text-white hover:bg-white/15" href="/dashboard/restaurant/orders">
                      Ver pedidos
                    </Link>
                  ) : null}
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                <p className="text-sm font-bold text-white/70">Perfil listo</p>
                <div className="mt-4 flex items-end gap-3">
                  <p className="text-5xl font-black">{profileScore}%</p>
                  <p className="pb-2 text-sm text-white/60">
                    {profileScore >= 85 ? 'Buen nivel para vender.' : 'Aun puedes mejorarlo.'}
                  </p>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/15">
                  <div className="h-full rounded-full bg-jade" style={{ width: `${profileScore}%` }} />
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Productos activos" value={activeProducts.length} hint={`${soldOutProducts.length} agotados`} />
            <MetricCard label="Servicios" value={dashboardData.services.length} hint="Publicados en el local" />
            <MetricCard label="Visitas al local" value={analyticsMap.business_view || 0} hint="Veces que abrieron tu pagina publica" />
            <MetricCard label="Pedidos activos" value={activeOrders.length} hint={money(orderAmount)} />
          </section>

          <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-6">
              <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-soft">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-jade">
                      Siguientes pasos
                    </p>
                    <h2 className="mt-1 text-2xl font-black text-ink">Que falta para vender mejor</h2>
                  </div>
                  {loading ? <p className="text-sm text-black/50">Cargando...</p> : null}
                </div>
                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  <ChecklistItem done={Boolean(business?.whatsapp || business?.phone)} title="Contacto listo" description="WhatsApp o telefono para recibir pedidos." />
                  <ChecklistItem done={Boolean(business?.logoUrl && business?.coverUrl)} title="Imagen del local" description="Logo y portada ayudan a que se vea confiable." />
                  <ChecklistItem done={activeProducts.length > 0} title="Catalogo activo" description="Agrega productos con precio y descripcion clara." />
                  <ChecklistItem done={Boolean(business?.address)} title="Ubicacion visible" description="Direccion para que el cliente sepa donde estas." />
                </div>
              </div>

              <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-soft">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <div>
                    <h2 className="text-2xl font-black text-ink">Productos destacados</h2>
                    <p className="mt-1 text-sm text-black/55">
                      Los de mayor precio activo aparecen primero para revisar fotos, descripcion y disponibilidad.
                    </p>
                  </div>
                  <Link className="btn-secondary justify-center" href="/dashboard/products">
                    Administrar
                  </Link>
                </div>
                <div className="mt-4 grid gap-3">
                  {topProducts.length ? (
                    topProducts.map((product) => (
                      <div key={product._id} className="flex items-center justify-between gap-4 rounded-xl border border-black/10 bg-black/[0.02] p-4">
                        <div className="min-w-0">
                          <p className="truncate font-bold text-ink">{product.name}</p>
                          <p className="mt-1 text-sm text-black/50">{product.category || 'Sin categoria'} - {product.status}</p>
                        </div>
                        <p className="shrink-0 rounded-full bg-jade/10 px-3 py-1 text-sm font-black text-jade">
                          {money(product.price)}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-xl border border-dashed border-black/15 p-5 text-sm text-black/55">
                      Agrega productos para que el panel pueda mostrar oportunidades de venta.
                    </div>
                  )}
                </div>
              </div>

              <BusinessProfileForm
                business={business}
                categories={categories}
                coverUrl={coverUrl}
                error={error}
                logoUrl={logoUrl}
                message={message}
                onCoverChange={setCoverUrl}
                onLogoChange={setLogoUrl}
                onSubmit={submit}
              />
            </div>

            <aside className="space-y-6">
              <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-soft">
                <h2 className="text-xl font-black text-ink">Acceso rapido</h2>
                <div className="mt-4 grid gap-2">
                  <QuickAction href="/dashboard/products" title="Productos" description="Precios, fotos y estado" />
                  <QuickAction href="/dashboard/categories" title="Categorias" description="Ordena tu catalogo" />
                  <QuickAction href="/dashboard/services" title="Servicios" description="Consultas o trabajos" />
                  {business?.modules?.includes('restaurant') ? (
                    <QuickAction href="/dashboard/restaurant/orders" title="Pedidos restaurante" description="Mesas y comandas" />
                  ) : null}
                </div>
              </div>

              <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-soft">
                <h2 className="text-xl font-black text-ink">Actividad reciente</h2>
                <div className="mt-4 space-y-3">
                  {dashboardData.orders.slice(0, 4).map((order) => (
                    <div key={order._id} className="rounded-xl bg-black/[0.03] p-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-bold text-ink">Pedido #{order.orderNumber}</p>
                        <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-black/55">
                          {order.status}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-black/55">
                        {order.items.length} items - {money(order.total)}
                      </p>
                    </div>
                  ))}
                  {!dashboardData.orders.length ? (
                    <p className="rounded-xl border border-dashed border-black/15 p-4 text-sm text-black/55">
                      Aun no hay pedidos registrados en el modulo restaurante.
                    </p>
                  ) : null}
                </div>
              </div>
            </aside>
          </section>
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}

function MetricCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: number;
  hint: string;
}) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-soft">
      <p className="text-sm font-bold text-black/50">{label}</p>
      <p className="mt-2 text-3xl font-black text-ink">{value}</p>
      <p className="mt-1 text-sm text-black/50">{hint}</p>
    </div>
  );
}

function ChecklistItem({
  done,
  title,
  description,
}: {
  done: boolean;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-3 rounded-xl border border-black/10 bg-black/[0.02] p-4">
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-black ${
          done ? 'bg-jade text-white' : 'bg-black/10 text-black/45'
        }`}
      >
        {done ? 'OK' : '-'}
      </span>
      <div>
        <p className="font-bold text-ink">{title}</p>
        <p className="mt-1 text-sm text-black/55">{description}</p>
      </div>
    </div>
  );
}

function QuickAction({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <Link className="rounded-xl border border-black/10 p-4 transition hover:border-jade/40 hover:bg-jade/5" href={href}>
      <p className="font-bold text-ink">{title}</p>
      <p className="mt-1 text-sm text-black/55">{description}</p>
    </Link>
  );
}

function BusinessProfileForm({
  business,
  categories,
  coverUrl,
  error,
  logoUrl,
  message,
  onCoverChange,
  onLogoChange,
  onSubmit,
}: {
  business: Business | null;
  categories: BusinessCategory[];
  coverUrl: string;
  error: string;
  logoUrl: string;
  message: string;
  onCoverChange: (value: string) => void;
  onLogoChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-soft">
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-jade">
          Datos publicos
        </p>
        <h2 className="mt-1 text-2xl font-black text-ink">Perfil del negocio</h2>
        <p className="mt-1 text-sm text-black/55">
          Esto es lo que ve el cliente cuando abre tu local.
        </p>
      </div>

      <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
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
          onChange={onLogoChange}
          previewLabel="Logo del negocio"
        />
        <ImageUrlField
          label="Portada"
          name="coverUrl"
          value={coverUrl}
          onChange={onCoverChange}
          previewLabel="Portada del negocio"
        />
        <div className="md:col-span-2">
          <button className="btn-primary">Guardar local</button>
          {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
          {message ? <p className="mt-3 text-sm text-jade">{message}</p> : null}
        </div>
      </form>
    </div>
  );
}
