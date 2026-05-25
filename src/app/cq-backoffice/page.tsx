'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch, money } from '@/lib/api';
import { clearSession, getToken, getUser, saveSession } from '@/lib/auth';
import type {
  AuthResponse,
  Business,
  BusinessCategory,
  BusinessModule,
  BusinessStatus,
  PlanCode,
  SubscriptionPlan,
} from '@/types/mercadito';

type BackofficeSection = 'businesses' | 'categories' | 'plans';

const planCodes: PlanCode[] = ['free', 'basic', 'plus', 'pro'];
const statusOptions: BusinessStatus[] = ['draft', 'active', 'suspended'];
const moduleOptions: Array<{ code: BusinessModule; label: string; hint: string }> = [
  { code: 'restaurant', label: 'Restaurante', hint: 'Mesas y pedidos QR' },
  { code: 'automotive', label: 'Automotriz', hint: 'Inventario vehiculos' },
  { code: 'workshop', label: 'Taller', hint: 'Servicios y ordenes' },
  { code: 'quotes', label: 'Cotizaciones', hint: 'Solicitudes con estado' },
  { code: 'appointments', label: 'Citas', hint: 'Agenda basica' },
];

export default function BackofficePage() {
  const router = useRouter();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [categories, setCategories] = useState<BusinessCategory[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [section, setSection] = useState<BackofficeSection>('businesses');
  const [error, setError] = useState('');
  const [hasSession, setHasSession] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [pendingAction, setPendingAction] = useState('');

  const stats = useMemo(
    () => ({
      total: businesses.length,
      active: businesses.filter((business) => business.status === 'active').length,
      suspended: businesses.filter((business) => business.status === 'suspended').length,
      premium: businesses.filter((business) =>
        business.plan === 'plus' || business.plan === 'pro',
      ).length,
    }),
    [businesses],
  );

  async function load() {
    const token = getToken();
    if (!token) return;

    const [businessData, categoryData, planData] = await Promise.all([
      apiFetch<Business[]>('/admin/businesses', { token }),
      apiFetch<BusinessCategory[]>('/admin/categories', { token }),
      apiFetch<SubscriptionPlan[]>('/admin/subscription-plans', { token }),
    ]);

    setBusinesses(businessData);
    setCategories(categoryData);
    setPlans(planData);
  }

  useEffect(() => {
    const user = getUser();
    const isAdmin = Boolean(getToken()) && user?.role === 'admin';
    setHasSession(isAdmin);
    if (!isAdmin) return;

    void load().catch((err) =>
      setError(err instanceof Error ? err.message : 'No se pudo cargar backoffice'),
    );
  }, []);

  async function loginAdmin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loginLoading) return;
    setError('');
    const form = new FormData(event.currentTarget);
    setLoginLoading(true);
    try {
      const session = await apiFetch<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: String(form.get('email') || ''),
          password: String(form.get('password') || ''),
        }),
      });

      if (session.user.role !== 'admin') {
        setError('Esta URL es solo para administradores.');
        return;
      }

      saveSession(session);
      setHasSession(true);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar sesion');
    } finally {
      setLoginLoading(false);
    }
  }

  function logoutAdmin() {
    clearSession();
    setHasSession(false);
    setBusinesses([]);
    setCategories([]);
    setPlans([]);
    router.push('/login');
  }

  async function updateBusiness(
    id: string,
    status: BusinessStatus,
    plan: PlanCode,
    modules?: BusinessModule[],
  ) {
    const token = getToken();
    if (!token || pendingAction) return;
    setError('');
    setPendingAction(`business:${id}`);

    try {
      await apiFetch(`/admin/businesses/${id}/status`, {
        method: 'PATCH',
        token,
        body: JSON.stringify({ status, plan, modules }),
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar negocio');
    } finally {
      setPendingAction('');
    }
  }

  function toggleModule(business: Business, moduleCode: BusinessModule) {
    const modules = business.modules.includes(moduleCode)
      ? business.modules.filter((module) => module !== moduleCode)
      : [...business.modules, moduleCode];

    return updateBusiness(business._id, business.status, business.plan, modules);
  }

  async function createCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const token = getToken();
    if (!token || pendingAction) return;
    const form = new FormData(event.currentTarget);
    setError('');
    setPendingAction('category:create');

    try {
      await apiFetch('/admin/categories', {
        method: 'POST',
        token,
        body: JSON.stringify({
          name: String(form.get('name') || ''),
          description: String(form.get('description') || ''),
          icon: String(form.get('icon') || ''),
          active: true,
        }),
      });
      event.currentTarget.reset();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear categoria');
    } finally {
      setPendingAction('');
    }
  }

  async function createPlan(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const token = getToken();
    if (!token || pendingAction) return;
    const form = new FormData(event.currentTarget);
    setError('');
    setPendingAction('plan:create');

    try {
      await apiFetch('/admin/subscription-plans', {
        method: 'POST',
        token,
        body: JSON.stringify({
          code: String(form.get('code') || 'free'),
          name: String(form.get('name') || ''),
          price: Number(form.get('price') || 0),
          productLimit: Number(form.get('productLimit') || 0),
          features: String(form.get('features') || '')
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean),
          active: true,
        }),
      });
      event.currentTarget.reset();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear plan');
    } finally {
      setPendingAction('');
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-jade">
              CodeQuetzal Backoffice
            </p>
            <h1 className="mt-1 text-3xl font-bold text-ink">
              Operacion del mercadito
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-black/60">
              Gestiona negocios, planes, categorias y modulos premium desde una
              vista operativa.
            </p>
            {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
          </div>
          {hasSession ? (
            <button
              className="btn-secondary w-fit"
              disabled={Boolean(pendingAction)}
              onClick={logoutAdmin}
              type="button"
            >
              Salir
            </button>
          ) : null}
        </div>

        {hasSession ? (
          <>
            <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Negocios" value={stats.total} />
              <StatCard label="Activos" value={stats.active} />
              <StatCard label="Suspendidos" value={stats.suspended} />
              <StatCard label="Plus / Pro" value={stats.premium} />
            </section>

            <nav className="surface flex flex-wrap gap-2 rounded-lg p-2">
              <SectionButton
                active={section === 'businesses'}
                label="Negocios"
                onClick={() => setSection('businesses')}
              />
              <SectionButton
                active={section === 'categories'}
                label="Categorias"
                onClick={() => setSection('categories')}
              />
              <SectionButton
                active={section === 'plans'}
                label="Planes"
                onClick={() => setSection('plans')}
              />
            </nav>

            {section === 'businesses' ? (
              <section className="space-y-3">
                {businesses.map((business) => (
                  <article key={business._id} className="surface rounded-lg p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-lg font-bold text-ink">
                            {business.name}
                          </h2>
                          <Badge tone={business.status === 'active' ? 'green' : 'gray'}>
                            {business.status}
                          </Badge>
                          <Badge tone="gray">Plan {business.plan}</Badge>
                        </div>
                        <p className="mt-1 text-sm text-black/50">
                          /{business.slug}
                        </p>
                        <p className="mt-2 text-sm text-black/60">
                          {business.modules.length
                            ? business.modules.join(', ')
                            : 'Sin modulos activos'}
                        </p>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2 lg:w-[420px]">
                        <label className="block">
                          <span className="text-xs font-semibold uppercase text-black/45">
                            Estado
                          </span>
                          <select
                            className="field mt-1"
                            disabled={pendingAction === `business:${business._id}`}
                            value={business.status}
                            onChange={(event) =>
                              void updateBusiness(
                                business._id,
                                event.target.value as BusinessStatus,
                                business.plan,
                                business.modules,
                              )
                            }
                          >
                            {statusOptions.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="block">
                          <span className="text-xs font-semibold uppercase text-black/45">
                            Plan
                          </span>
                          <select
                            className="field mt-1"
                            disabled={pendingAction === `business:${business._id}`}
                            value={business.plan}
                            onChange={(event) =>
                              void updateBusiness(
                                business._id,
                                business.status,
                                event.target.value as PlanCode,
                                business.modules,
                              )
                            }
                          >
                            {planCodes.map((plan) => (
                              <option key={plan} value={plan}>
                                {plan}
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>
                    </div>

                    <div className="mt-5 border-t border-black/10 pt-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-black/45">
                        Modulos premium
                      </p>
                      <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-5">
                        {moduleOptions.map((moduleOption) => {
                          const enabled = business.modules.includes(moduleOption.code);
                          return (
                            <button
                              key={moduleOption.code}
                              disabled={pendingAction === `business:${business._id}`}
                              className={`rounded-lg border p-3 text-left transition ${
                                enabled
                                  ? 'border-jade bg-jade/10 text-jade'
                                  : 'border-black/10 bg-white text-ink hover:border-black/25'
                              }`}
                              onClick={() => void toggleModule(business, moduleOption.code)}
                            >
                              <span className="block text-sm font-bold">
                                {pendingAction === `business:${business._id}`
                                  ? 'Guardando · '
                                  : enabled
                                    ? 'Activo · '
                                    : ''}
                                {moduleOption.label}
                              </span>
                              <span className="mt-1 block text-xs text-black/55">
                                {moduleOption.hint}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </article>
                ))}
              </section>
            ) : null}

            {section === 'categories' ? (
              <section className="grid gap-6 lg:grid-cols-[420px_1fr]">
                <form className="surface h-fit rounded-lg p-5" onSubmit={createCategory}>
                  <h2 className="text-xl font-bold text-ink">Nueva categoria</h2>
                  <div className="mt-4 grid gap-3">
                    <input
                      className="field"
                      disabled={pendingAction === 'category:create'}
                      name="name"
                      placeholder="Nombre"
                      required
                    />
                    <input
                      className="field"
                      disabled={pendingAction === 'category:create'}
                      name="description"
                      placeholder="Descripcion"
                    />
                    <input
                      className="field"
                      disabled={pendingAction === 'category:create'}
                      name="icon"
                      placeholder="Icono"
                    />
                    <button
                      className="btn-primary disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={pendingAction === 'category:create'}
                    >
                      {pendingAction === 'category:create'
                        ? 'Creando...'
                        : 'Crear categoria'}
                    </button>
                  </div>
                </form>

                <div className="grid gap-3 sm:grid-cols-2">
                  {categories.map((category) => (
                    <article key={category._id} className="surface rounded-lg p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-bold text-ink">{category.name}</h3>
                          <p className="mt-1 text-xs text-black/50">/{category.slug}</p>
                        </div>
                        <Badge tone={category.active ? 'green' : 'gray'}>
                          {category.active ? 'Activa' : 'Inactiva'}
                        </Badge>
                      </div>
                      {category.description ? (
                        <p className="mt-3 text-sm text-black/60">
                          {category.description}
                        </p>
                      ) : null}
                    </article>
                  ))}
                </div>
              </section>
            ) : null}

            {section === 'plans' ? (
              <section className="grid gap-6 lg:grid-cols-[420px_1fr]">
                <form className="surface h-fit rounded-lg p-5" onSubmit={createPlan}>
                  <h2 className="text-xl font-bold text-ink">Nuevo plan</h2>
                  <div className="mt-4 grid gap-3">
                    <select
                      className="field"
                      disabled={pendingAction === 'plan:create'}
                      name="code"
                      defaultValue="free"
                    >
                      {planCodes.map((plan) => (
                        <option key={plan} value={plan}>
                          {plan}
                        </option>
                      ))}
                    </select>
                    <input
                      className="field"
                      disabled={pendingAction === 'plan:create'}
                      name="name"
                      placeholder="Nombre"
                      required
                    />
                    <input
                      className="field"
                      disabled={pendingAction === 'plan:create'}
                      name="price"
                      type="number"
                      placeholder="Precio"
                    />
                    <input
                      className="field"
                      disabled={pendingAction === 'plan:create'}
                      name="productLimit"
                      type="number"
                      placeholder="Limite productos"
                    />
                    <input
                      className="field"
                      disabled={pendingAction === 'plan:create'}
                      name="features"
                      placeholder="Features separadas por coma"
                    />
                    <button
                      className="btn-primary disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={pendingAction === 'plan:create'}
                    >
                      {pendingAction === 'plan:create' ? 'Creando...' : 'Crear plan'}
                    </button>
                  </div>
                </form>

                <div className="grid gap-3 md:grid-cols-2">
                  {plans.map((plan) => (
                    <article key={plan._id} className="surface rounded-lg p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-bold text-ink">{plan.name}</h3>
                          <p className="text-sm font-semibold text-jade">
                            {money(plan.price)}
                          </p>
                        </div>
                        <Badge tone={plan.active ? 'green' : 'gray'}>{plan.code}</Badge>
                      </div>
                      <p className="mt-3 text-sm text-black/60">
                        {plan.productLimit} productos
                      </p>
                      <p className="mt-1 text-xs text-black/50">
                        {plan.features.join(', ')}
                      </p>
                    </article>
                  ))}
                </div>
              </section>
            ) : null}
          </>
        ) : (
          <section className="surface mx-auto max-w-md rounded-lg p-6">
            <h2 className="text-xl font-bold text-ink">Login backoffice</h2>
            <p className="mt-2 text-sm text-black/60">
              Acceso privado para administradores de CodeQuetzal.
            </p>
            <form className="mt-5 space-y-4" onSubmit={loginAdmin}>
              <label className="block">
                <span className="text-sm font-medium">Email</span>
                <input className="field mt-1" name="email" type="email" required />
              </label>
              <label className="block">
                <span className="text-sm font-medium">Password</span>
                <input
                  className="field mt-1"
                  name="password"
                  type="password"
                  required
                />
              </label>
              <button
                className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
                disabled={loginLoading}
              >
                {loginLoading ? 'Entrando...' : 'Entrar'}
              </button>
            </form>
          </section>
        )}
      </div>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <article className="surface rounded-lg p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-black/45">
        {label}
      </p>
      <p className="mt-2 text-3xl font-bold text-ink">{value}</p>
    </article>
  );
}

function SectionButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className={`rounded-md px-4 py-2 text-sm font-semibold transition ${
        active ? 'bg-jade text-white' : 'text-black/65 hover:bg-black/5'
      }`}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}

function Badge({
  children,
  tone,
}: {
  children: ReactNode;
  tone: 'green' | 'gray';
}) {
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
        tone === 'green' ? 'bg-jade/10 text-jade' : 'bg-black/5 text-black/55'
      }`}
    >
      {children}
    </span>
  );
}
