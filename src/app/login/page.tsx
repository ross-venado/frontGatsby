'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { saveSession } from '@/lib/auth';
import type { AuthResponse } from '@/types/mercadito';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setLoading(true);

    const form = new FormData(event.currentTarget);
    const payload = {
      name: String(form.get('name') || ''),
      email: String(form.get('email') || ''),
      password: String(form.get('password') || ''),
      role: String(form.get('role') || 'business_owner'),
    };

    try {
      const session = await apiFetch<AuthResponse>(
        mode === 'login' ? '/auth/login' : '/auth/register',
        {
          method: 'POST',
          body: JSON.stringify(
            mode === 'login'
              ? { email: payload.email, password: payload.password }
              : payload,
          ),
        },
      );

      saveSession(session);
      router.push(payload.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar sesion');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-md px-4 py-12">
      <div className="surface rounded-lg p-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-jade">
          Acceso
        </p>
        <h1 className="mt-2 text-3xl font-bold text-ink">
          {mode === 'login' ? 'Entrar al panel' : 'Crear cuenta'}
        </h1>
        <div className="mt-5 grid grid-cols-2 rounded-md bg-black/5 p-1">
          <button
            className={`rounded px-3 py-2 text-sm font-semibold ${mode === 'login' ? 'bg-white shadow-sm' : ''}`}
            onClick={() => setMode('login')}
          >
            Login
          </button>
          <button
            className={`rounded px-3 py-2 text-sm font-semibold ${mode === 'register' ? 'bg-white shadow-sm' : ''}`}
            onClick={() => setMode('register')}
          >
            Registro
          </button>
        </div>

        <form className="mt-6 space-y-4" onSubmit={submit}>
          {mode === 'register' ? (
            <>
              <label className="block">
                <span className="text-sm font-medium text-ink">Nombre</span>
                <input className="field mt-1" name="name" required />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-ink">Rol</span>
                <select className="field mt-1" name="role" defaultValue="business_owner">
                  <option value="business_owner">Negocio</option>
                  <option value="admin">Admin</option>
                </select>
              </label>
            </>
          ) : null}

          <label className="block">
            <span className="text-sm font-medium text-ink">Email</span>
            <input className="field mt-1" name="email" type="email" required />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-ink">Password</span>
            <input className="field mt-1" name="password" type="password" required />
          </label>

          {error ? (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          <button className="btn-primary w-full" disabled={loading}>
            {loading ? 'Procesando...' : 'Continuar'}
          </button>
        </form>
      </div>
    </main>
  );
}
