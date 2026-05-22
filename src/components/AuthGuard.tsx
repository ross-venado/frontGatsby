'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getToken } from '@/lib/auth';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    setHasToken(Boolean(getToken()));
    setReady(true);
  }, []);

  if (!ready) {
    return <div className="p-6 text-sm text-black/60">Cargando panel...</div>;
  }

  if (!hasToken) {
    return (
      <div className="surface rounded-lg p-8">
        <h1 className="text-2xl font-bold text-ink">Necesitas iniciar sesion</h1>
        <p className="mt-2 text-black/60">
          Entra con tu usuario para administrar tu local digital.
        </p>
        <Link className="btn-primary mt-5" href="/login">
          Ir a login
        </Link>
      </div>
    );
  }

  return children;
}
