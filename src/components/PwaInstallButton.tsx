'use client';

import { useEffect, useState } from 'react';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

function isIos() {
  if (typeof navigator === 'undefined') {
    return false;
  }

  return (
    /iphone|ipad|ipod/i.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
}

function isStandalone() {
  if (typeof window === 'undefined') {
    return false;
  }

  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    ('standalone' in navigator && Boolean(navigator.standalone))
  );
}

export function PwaInstallButton() {
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showIosHelp, setShowIosHelp] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    setInstalled(isStandalone());
    setShowIosHelp(isIos() && !isStandalone());

    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    }

    function handleAppInstalled() {
      setInstalled(true);
      setInstallPrompt(null);
      setShowIosHelp(false);
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  useEffect(() => {
    if (!showIosHelp) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setShowIosHelp(false);
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showIosHelp]);

  async function install() {
    if (installPrompt) {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;

      if (choice.outcome === 'accepted') {
        setInstalled(true);
      }

      setInstallPrompt(null);
      return;
    }

    setShowIosHelp((current) => !current);
  }

  if (installed) {
    return null;
  }

  if (!installPrompt && !showIosHelp) {
    return null;
  }

  return (
    <div className="relative">
      <button className="btn-secondary whitespace-nowrap px-3 text-xs sm:px-4 sm:text-sm" type="button" onClick={() => void install()}>
        Guardar
      </button>
      {showIosHelp ? (
        <>
          <button
            aria-label="Cerrar ayuda para guardar"
            className="fixed inset-0 z-10 cursor-default bg-transparent"
            type="button"
            onClick={() => setShowIosHelp(false)}
          />
          <div className="absolute right-0 top-12 z-20 w-[min(18rem,calc(100vw-2rem))] rounded-lg border border-black/10 bg-white p-4 text-sm shadow-soft">
            <div className="flex items-start justify-between gap-3">
              <p className="font-bold text-ink">Guardar en tu celular</p>
              <button
                aria-label="Cerrar"
                className="-mr-1 -mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-black/10 text-lg leading-none text-black/55 hover:bg-black/5"
                type="button"
                onClick={() => setShowIosHelp(false)}
              >
                x
              </button>
            </div>
          <p className="mt-2 text-black/60">
            En iPhone o iPad debe ser desde Safari: toca Compartir y luego
            Agregar a pantalla de inicio.
          </p>
          </div>
        </>
      ) : null}
    </div>
  );
}
