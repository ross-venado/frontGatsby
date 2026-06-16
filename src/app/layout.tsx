import type { Metadata } from 'next';
import Link from 'next/link';
import { PwaInstallButton } from '@/components/PwaInstallButton';
import { PwaRegister } from '@/components/PwaRegister';
import { SiteNav } from '@/components/SiteNav';
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
      <body className="overflow-x-hidden">
        <header className="border-b border-black/10 bg-white/85 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3 sm:py-4">
            <Link href="/" className="max-w-[118px] text-sm font-bold leading-tight text-ink sm:max-w-none sm:text-base">
              Mercadito Chimalteco
            </Link>
            <div className="flex min-w-0 items-center gap-1 sm:gap-2">
              <SiteNav />
              <PwaInstallButton />
            </div>
          </div>
        </header>
        {children}
        <PwaRegister />
      </body>
    </html>
  );
}
