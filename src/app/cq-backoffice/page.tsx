'use client';

import { FormEvent, useEffect, useState } from 'react';
import { apiFetch, money } from '@/lib/api';
import { getToken, getUser, saveSession } from '@/lib/auth';
import type {
  AuthResponse,
  Business,
  BusinessCategory,
  BusinessModule,
  BusinessStatus,
  PlanCode,
  SubscriptionPlan,
} from '@/types/mercadito';

export default function BackofficePage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [categories, setCategories] = useState<BusinessCategory[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [error, setError] = useState('');
  const [hasSession, setHasSession] = useState(false);

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
    setError('');
    const form = new FormData(event.currentTarget);
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
    }
  }

  async function updateBusiness(
    id: string,
    status: BusinessStatus,
    plan: PlanCode,
    modules?: BusinessModule[],
  ) {
    const token = getToken();
    if (!token) return;
    await apiFetch(`/admin/businesses/${id}/status`, {
      method: 'PATCH',
      token,
      body: JSON.stringify({ status, plan, modules }),
    });
    await load();
  }

  function toggleRestaurantModule(business: Business) {
    const modules = business.modules.includes('restaurant')
      ? business.modules.filter((module) => module !== 'restaurant')
      : [...business.modules, 'restaurant' as BusinessModule];

    return updateBusiness(business._id, business.status, business.plan, modules);
  }

  async function createCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const token = getToken();
    if (!token) return;
    const form = new FormData(event.currentTarget);
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
  }

  async function createPlan(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const token = getToken();
    if (!token) return;
    const form = new FormData(event.currentTarget);
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
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="space-y-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-jade">
              CodeQuetzal Backoffice
            </p>
            <h1 className="mt-1 text-3xl font-bold text-ink">
              Operacion del mercadito
            </h1>
            {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
          </div>

        {hasSession ? (
          <>
            <section className="surface rounded-lg p-5">
            <h2 className="text-xl font-bold text-ink">Negocios registrados</h2>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="border-b border-black/10 text-black/55">
                  <tr>
                    <th className="py-2">Negocio</th>
                    <th className="py-2">Estado</th>
                    <th className="py-2">Plan</th>
                    <th className="py-2">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {businesses.map((business) => (
                    <tr key={business._id} className="border-b border-black/5">
                      <td className="py-3">
                        <p className="font-semibold">{business.name}</p>
                        <p className="text-xs text-black/50">/{business.slug}</p>
                      </td>
                      <td className="py-3">{business.status}</td>
                      <td className="py-3">
                        <p>{business.plan}</p>
                        <p className="text-xs text-black/50">
                          {business.modules.join(', ')}
                        </p>
                      </td>
                      <td className="flex flex-wrap gap-2 py-3">
                        <button className="btn-secondary" onClick={() => void updateBusiness(business._id, 'active', business.plan)}>
                          Aprobar
                        </button>
                        <button className="btn-secondary" onClick={() => void updateBusiness(business._id, 'suspended', business.plan)}>
                          Suspender
                        </button>
                        {(['free', 'basic', 'plus', 'pro'] as PlanCode[]).map((plan) => (
                          <button key={plan} className="btn-secondary" onClick={() => void updateBusiness(business._id, business.status, plan)}>
                            {plan}
                          </button>
                        ))}
                        <button className="btn-secondary" onClick={() => void toggleRestaurantModule(business)}>
                          {business.modules.includes('restaurant')
                            ? 'Quitar restaurante'
                            : 'Activar restaurante'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            </section>

            <div className="grid gap-6 lg:grid-cols-2">
            <section className="surface rounded-lg p-5">
              <h2 className="text-xl font-bold text-ink">Categorias marketplace</h2>
              <form className="mt-4 grid gap-3" onSubmit={createCategory}>
                <input className="field" name="name" placeholder="Nombre" required />
                <input className="field" name="description" placeholder="Descripcion" />
                <input className="field" name="icon" placeholder="Icono" />
                <button className="btn-primary">Crear categoria</button>
              </form>
              <div className="mt-4 grid gap-2">
                {categories.map((category) => (
                  <div key={category._id} className="rounded-md bg-black/[0.03] p-3">
                    <p className="font-semibold">{category.name}</p>
                    <p className="text-xs text-black/50">/{category.slug}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="surface rounded-lg p-5">
              <h2 className="text-xl font-bold text-ink">Planes</h2>
              <form className="mt-4 grid gap-3" onSubmit={createPlan}>
                <select className="field" name="code" defaultValue="free">
                  <option value="free">free</option>
                  <option value="basic">basic</option>
                  <option value="plus">plus</option>
                  <option value="pro">pro</option>
                </select>
                <input className="field" name="name" placeholder="Nombre" required />
                <input className="field" name="price" type="number" placeholder="Precio" />
                <input className="field" name="productLimit" type="number" placeholder="Limite productos" />
                <input className="field" name="features" placeholder="Features separadas por coma" />
                <button className="btn-primary">Crear plan</button>
              </form>
              <div className="mt-4 grid gap-2">
                {plans.map((plan) => (
                  <div key={plan._id} className="rounded-md bg-black/[0.03] p-3">
                    <p className="font-semibold">
                      {plan.name} · {money(plan.price)}
                    </p>
                    <p className="text-xs text-black/50">
                      {plan.productLimit} productos · {plan.features.join(', ')}
                    </p>
                  </div>
                ))}
              </div>
            </section>
            </div>
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
              <button className="btn-primary w-full">Entrar</button>
            </form>
          </section>
        )}
      </div>
    </main>
  );
}
