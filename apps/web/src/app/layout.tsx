import { ClerkProvider } from '@clerk/nextjs';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';

import { QueryProvider } from '@/shared/providers/query-provider';

import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'Trofo School — Educadores y cuidadores para tu familia',
    template: '%s · Trofo School',
  },
  description:
    'Conecta con educadores y cuidadores de confianza para la primera infancia. Perfiles verificados, valoraciones y disponibilidad clara.',
  keywords: [
    'primera infancia',
    'educación infantil',
    'babysitter',
    'cuidado infantil',
    'familias',
    'educadores',
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      signInFallbackRedirectUrl="/mi-espacio"
      signUpFallbackRedirectUrl="/mi-espacio"
      afterSignOutUrl="/"
    >
      <html lang="es">
        <body
          className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-stone-50 font-sans text-stone-900 antialiased`}
        >
          <QueryProvider>{children}</QueryProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
