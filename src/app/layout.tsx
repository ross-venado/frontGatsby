import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'Mercadito Chimalteco by CodeQuetzal',
  description: 'Locales digitales para negocios de Chimaltenango.',
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
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
            <Link href="/" className="font-bold text-ink">
              Mercadito Chimalteco
            </Link>
            <nav className="flex items-center gap-2 text-sm">
              <Link className="rounded-md px-3 py-2 hover:bg-black/5" href="/businesses">
                Negocios
              </Link>
              <Link className="rounded-md px-3 py-2 hover:bg-black/5" href="/login">
                Login
              </Link>
              <Link className="btn-primary" href="/dashboard">
                Panel
              </Link>
            </nav>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
