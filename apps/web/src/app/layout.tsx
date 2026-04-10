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
  title: 'TrofoSchool',
  description: 'Plataforma de educación de primera infancia',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      signInFallbackRedirectUrl="/bootstrap"
      signUpFallbackRedirectUrl="/bootstrap"
      afterSignOutUrl="/"
    >
      <html lang="es">
        <body
          className={`${geistSans.variable} ${geistMono.variable} bg-zinc-50 text-zinc-900 antialiased`}
        >
          <QueryProvider>{children}</QueryProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
