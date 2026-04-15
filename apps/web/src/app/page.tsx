import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

import { syncUserWithToken } from '@/features/bootstrap/server-sync';
import { landingPathAfterBootstrap } from '@/shared/lib/routing';

import { HomeLanding } from './home-landing';

export default async function HomePage() {
  const a = await auth();
  if (a.userId) {
    const token = await a.getToken();
    if (token) {
      try {
        const data = await syncUserWithToken(token);
        if (data?.bootstrap) {
          redirect(landingPathAfterBootstrap(data.bootstrap));
        }
      } catch {
        // Si la API falla, mostramos la landing pública.
      }
    }
  }

  return <HomeLanding />;
}
