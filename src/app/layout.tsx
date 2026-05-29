import type { Metadata } from 'next';
import Link from 'next/link';
import { PwaInstallButton } from '@/components/PwaInstallButton';
import { PwaRegister } from '@/components/PwaRegister';
import './globals.css';

export const metadata: Metadata = {
  applicationName: 'Mercadito Chimalteco',
  title: 'Mercadito Chimalteco by CodeQuetzal',
  description: 'Locales digitales para negocios de Chimaltenango.',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Mercadito',
  },
  formatDetection: {
    telephone: true,
  },
  icons: {
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { url: '/icons/mercadito-icon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/icons/icon-192.png',
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180' }],
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-title': 'Mercadito',
    'apple-mobile-web-app-status-bar-style': 'default',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-GT">
      <body>
        <header className="border-b border-black/10 bg-white/85 backdrop-blur">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4">
            <Link href="/" className="max-w-[170px] font-bold leading-tight text-ink sm:max-w-none">
              Mercadito Chimalteco
            </Link>
            <nav className="flex items-center gap-1 text-sm sm:gap-2">
              <Link className="rounded-md px-2 py-2 hover:bg-black/5 sm:px-3" href="/businesses">
                Negocios
              </Link>
              <Link className="rounded-md px-2 py-2 hover:bg-black/5 sm:px-3" href="/login">
                Login
              </Link>
              <Link className="btn-primary" href="/dashboard">
                Panel
              </Link>
              <PwaInstallButton />
            </nav>
          </div>
        </header>
        {children}
        <PwaRegister />
      </body>
    </html>
  );
}
