'use client';

import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';

import { useSyncMutation } from '@/features/bootstrap/hooks/use-bootstrap';
import { pathAfterBootstrap } from '@/shared/lib/routing';
import { useUiStore } from '@/shared/stores/ui-store';

export default function BootstrapPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const sync = useSyncMutation();
  const setLast = useUiStore((s) => s.setLastBootstrapPath);
  const ran = useRef(false);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || ran.current) {
      return;
    }
    ran.current = true;
    sync.mutate(undefined, {
      onSuccess: (data) => {
        const next = pathAfterBootstrap(data.bootstrap);
        setLast(next);
        router.replace(next);
      },
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps -- single sync after sign-in
  }, [isLoaded, isSignedIn, router, setLast]);

  if (sync.isError) {
    return (
      <div className="mx-auto max-w-md p-8">
        <h1 className="text-lg font-semibold">No pudimos sincronizar tu cuenta</h1>
        <p className="mt-2 text-sm text-red-600">
          {sync.error instanceof Error ? sync.error.message : 'Error desconocido'}
        </p>
        <p className="mt-4 text-sm text-zinc-600">
          Comprueba que la API esté en marcha y que{' '}
          <code className="rounded bg-zinc-100 px-1">NEXT_PUBLIC_API_URL</code> y{' '}
          <code className="rounded bg-zinc-100 px-1">CLERK_SECRET_KEY</code>{' '}
          coincidan con tu instancia de Clerk.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-3 p-8 text-center">
      <p className="text-sm text-zinc-600">Preparando tu espacio…</p>
      <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-900" />
    </div>
  );
}
