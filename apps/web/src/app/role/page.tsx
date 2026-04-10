'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { useBootstrapQuery, useSetRoleMutation } from '@/features/bootstrap/hooks/use-bootstrap';
import { pathAfterBootstrap } from '@/shared/lib/routing';
import { Button } from '@/shared/components/ui/button';

export default function RoleSelectionPage() {
  const router = useRouter();
  const { data, isLoading, isError, error, refetch } = useBootstrapQuery();
  const setRole = useSetRoleMutation();

  useEffect(() => {
    if (data && !data.needsRoleSelection) {
      router.replace(pathAfterBootstrap(data));
    }
  }, [data, router]);

  if (isLoading || !data) {
    return (
      <div className="mx-auto max-w-md p-8 text-center text-sm text-zinc-600">
        Cargando…
      </div>
    );
  }

  if (!data.needsRoleSelection) {
    return (
      <div className="mx-auto max-w-md p-8 text-center text-sm text-zinc-600">
        Redirigiendo…
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-md p-8">
        <p className="text-sm text-red-600">
          {error instanceof Error ? error.message : 'Error'}
        </p>
        <Button className="mt-4" onClick={() => refetch()}>
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-md space-y-6 p-8">
      <div>
        <h1 className="text-2xl font-semibold">¿Cómo usarás TrofoSchool?</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Elige un tipo de cuenta. Esta elección no se puede cambiar en el MVP.
        </p>
      </div>
      <div className="flex flex-col gap-3">
        <Button
          className="w-full py-3 text-base"
          disabled={setRole.isPending}
          onClick={() =>
            setRole.mutate('CONSUMER', {
              onSuccess: (b) => router.replace(pathAfterBootstrap(b)),
            })
          }
        >
          Soy familia / acudiente
        </Button>
        <Button
          variant="secondary"
          className="w-full py-3 text-base"
          disabled={setRole.isPending}
          onClick={() =>
            setRole.mutate('PROVIDER', {
              onSuccess: (b) => router.replace(pathAfterBootstrap(b)),
            })
          }
        >
          Soy educador / proveedor
        </Button>
      </div>
    </main>
  );
}
