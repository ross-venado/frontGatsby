'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { clearSession, getToken, getUser, onSessionChange } from '@/lib/auth';
import type { AuthUser } from '@/types/mercadito';

export function SiteNav() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    function syncSession() {
      const token = getToken();
      setHasSession(Boolean(token));
      setUser(token ? getUser() : null);
    }

    syncSession();
    return onSessionChange(syncSession);
  }, []);

  const panelHref = user?.role === 'admin' ? '/cq-backoffice' : '/dashboard';

  function logout() {
    clearSession();
    router.push('/');
  }

  return (
    <nav className="flex min-w-0 items-center gap-1 text-xs sm:gap-2 sm:text-sm">
      <Link className="hidden rounded-md px-2 py-2 hover:bg-black/5 sm:inline-flex sm:px-3" href="/businesses">
        Negocios
      </Link>
      <Link className="hidden rounded-md px-2 py-2 hover:bg-black/5 min-[430px]:inline-flex sm:px-3" href="/vende-en-chimaltenango">
        Vender
      </Link>
      <Link className="hidden rounded-md px-2 py-2 hover:bg-black/5 md:inline-flex sm:px-3" href="/pricing">
        Precios
      </Link>
      {hasSession ? (
        <>
          <button
            className="hidden rounded-md px-2 py-2 font-bold text-black/60 hover:bg-black/5 hover:text-ink min-[390px]:inline-flex sm:px-3"
            type="button"
            onClick={logout}
          >
            Salir
          </button>
          <Link className="btn-primary" href={panelHref}>
            Panel
          </Link>
        </>
      ) : (
        <>
          <Link className="hidden rounded-md px-2 py-2 hover:bg-black/5 min-[390px]:inline-flex sm:px-3" href="/login">
            Login
          </Link>
          <Link className="btn-primary" href="/login">
            Panel
          </Link>
        </>
      )}
    </nav>
  );
}
