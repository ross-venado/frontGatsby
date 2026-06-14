'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch, money } from '@/lib/api';
import {
  businessCategorySlug,
  moduleDefinitions,
  modulesForPlanAndCategory,
  recommendedModulesForCategory,
} from '@/lib/business-modules';
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
const moduleOptions = moduleDefinitions;
const validSections: BackofficeSection[] = ['businesses', 'categories', 'plans'];

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
    const tab = new URLSearchParams(window.location.search).get('tab');
    if (tab && validSections.includes(tab as BackofficeSection)) {
      setSection(tab as BackofficeSection);
    }

    const user = getUser();
    const isAdmin = Boolean(getToken()) && user?.role === 'admin';
    setHasSession(isAdmin);
    if (!isAdmin) return;

    void load().catch((err) =>
      setError(err instanceof Error ? err.message : 'No se pudo cargar backoffice'),
    );
  }, []);

  function changeSection(nextSection: BackofficeSection) {
    setSection(nextSection);
    const url = new URL(window.location.href);
    url.searchParams.set('tab', nextSection);
    window.history.replaceState(null, '', url.toString());
  }

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

  function applyRecommendedModules(business: Business) {
    const categorySlug = businessCategorySlug(business);
    const modules = modulesForPlanAndCategory(
      business.plan,
      categorySlug,
      business.modules,
    );

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
    <main className="min-h-screen bg-[#f5f2ea] px-4 py-6">
      <div className="mx-auto max-w-7xl">
      <div className="space-y-6">
        <div className="overflow-hidden rounded-3xl border border-black/10 bg-ink text-white shadow-soft">
          <div className="grid gap-5 p-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-end md:p-7">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-jade">
              CodeQuetzal Backoffice
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight md:text-4xl">
              Operacion del mercadito
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/65">
              Gestiona negocios, planes, categorias y modulos premium desde una
              vista operativa.
            </p>
            {error ? (
              <p className="mt-4 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                {error}
              </p>
            ) : null}
          </div>
          {hasSession ? (
            <button
              className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-black text-white transition hover:bg-white/15"
              disabled={Boolean(pendingAction)}
              onClick={logoutAdmin}
              type="button"
            >
              Salir
            </button>
          ) : null}
          </div>
        </div>

        {hasSession ? (
          <>
            <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Negocios" value={stats.total} />
              <StatCard label="Activos" value={stats.active} />
              <StatCard label="Suspendidos" value={stats.suspended} />
              <StatCard label="Plus / Pro" value={stats.premium} />
            </section>

            <nav className="surface flex flex-wrap gap-2 rounded-2xl p-2">
              <SectionButton
                active={section === 'businesses'}
                label="Negocios"
                onClick={() => changeSection('businesses')}
              />
              <SectionButton
                active={section === 'categories'}
                label="Categorias"
                onClick={() => changeSection('categories')}
              />
              <SectionButton
                active={section === 'plans'}
                label="Planes"
                onClick={() => changeSection('plans')}
              />
            </nav>

            {section === 'businesses' ? (
              <section className="space-y-3">
                {businesses.map((business) => {
                  const categorySlug = businessCategorySlug(business);
                  const recommendedModules = recommendedModulesForCategory(categorySlug);
                  const missingRecommendedModules = recommendedModules.filter(
                    (moduleCode) => !business.modules.includes(moduleCode),
                  );

                  return (
                  <article key={business._id} className="surface overflow-hidden rounded-2xl p-0">
                    <div className="border-b border-black/10 bg-gradient-to-r from-white to-jade/5 p-5">
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
                          {categorySlug ? <Badge tone="gray">{categorySlug}</Badge> : null}
                        </div>
                        <p className="mt-1 text-sm text-black/50">
                          /{business.slug}
                        </p>
                        <p className="mt-2 text-sm text-black/60">
                          {business.modules.length
                            ? business.modules.join(', ')
                            : 'Sin modulos activos'}
                        </p>
                        {recommendedModules.length ? (
                          <p className="mt-2 text-sm text-black/50">
                            Recomendado para este nicho:{' '}
                            {recommendedModules.join(', ')}
                          </p>
                        ) : null}
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
                            onChange={(event) => {
                              const nextPlan = event.target.value as PlanCode;
                              const nextModules = modulesForPlanAndCategory(
                                nextPlan,
                                categorySlug,
                                business.modules,
                              );

                              void updateBusiness(
                                business._id,
                                business.status,
                                nextPlan,
                                nextModules,
                              );
                            }}
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
                    </div>

                    <div className="p-5">
                      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-black/45">
                            Modulos premium
                          </p>
                          <p className="mt-1 text-sm text-black/55">
                            Activa el adicional que corresponde al nicho o al plan comprado.
                          </p>
                        </div>
                        {missingRecommendedModules.length ? (
                          <button
                            className="btn-secondary w-fit"
                            disabled={pendingAction === `business:${business._id}`}
                            onClick={() => void applyRecommendedModules(business)}
                            type="button"
                          >
                            Aplicar recomendados
                          </button>
                        ) : null}
                      </div>
                      <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-5">
                        {moduleOptions.map((moduleOption) => {
                          const enabled = business.modules.includes(moduleOption.code);
                          const recommended = recommendedModules.includes(moduleOption.code);
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
                                    : recommended
                                      ? 'Sugerido · '
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
                  );
                })}
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
