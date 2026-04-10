'use client';

import { useAuth } from '@clerk/nextjs';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import {
  bootstrapQueryKey,
  fetchBootstrap,
} from '@/features/bootstrap/api/bootstrap-api';
import {
  deleteChild,
  getConsumerProfile,
  patchChild,
  patchConsumerProfile,
  postChild,
} from '@/features/consumer/api/consumer-api';
import { AppHeader } from '@/shared/components/app-header';
import { Button } from '@/shared/components/ui/button';
import { Field, Input } from '@/shared/components/ui/field';

type ChildRow = {
  clientKey: string;
  id?: string;
  firstName: string;
  birthDate: string;
  interests: string;
  notes: string;
};

function newRow(): ChildRow {
  return {
    clientKey: crypto.randomUUID(),
    firstName: '',
    birthDate: '',
    interests: '',
    notes: '',
  };
}

export default function ConsumerProfilePage() {
  const { getToken } = useAuth();
  const router = useRouter();
  const qc = useQueryClient();

  const bootstrapQuery = useQuery({
    queryKey: bootstrapQueryKey,
    queryFn: () => fetchBootstrap(getToken),
  });

  const profileQuery = useQuery({
    queryKey: ['consumer-profile'],
    queryFn: () => getConsumerProfile(getToken),
    enabled: bootstrapQuery.data?.user.role === 'CONSUMER',
  });

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [relationship, setRelationship] = useState('');
  const [children, setChildren] = useState<ChildRow[]>([newRow()]);

  useEffect(() => {
    const p = profileQuery.data;
    if (!p) return;
    setFullName(p.fullName ?? '');
    setPhone(p.phone ?? '');
    setCity(p.city ?? '');
    setRelationship(p.relationshipToChild ?? '');
    if (p.children.length) {
      setChildren(
        p.children.map((c) => ({
          clientKey: c.id,
          id: c.id,
          firstName: c.firstName,
          birthDate: c.birthDate.slice(0, 10),
          interests: c.interests ?? '',
          notes: c.notes ?? '',
        })),
      );
    } else {
      setChildren([newRow()]);
    }
  }, [profileQuery.data]);

  useEffect(() => {
    const b = bootstrapQuery.data;
    if (!b) return;
    if (b.needsRoleSelection) {
      router.replace('/role');
      return;
    }
    if (b.user.role !== 'CONSUMER') {
      router.replace('/dashboard/provider');
      return;
    }
    if (b.needsOnboarding) {
      router.replace('/onboarding/consumer');
    }
  }, [bootstrapQuery.data, router]);

  const save = useMutation({
    mutationFn: async () => {
      await patchConsumerProfile(getToken, {
        fullName,
        phone,
        city,
        relationshipToChild: relationship,
      });

      const existingServer = profileQuery.data?.children ?? [];
      const currentIds = new Set(
        children.map((c) => c.id).filter(Boolean) as string[],
      );
      for (const prev of existingServer) {
        if (!currentIds.has(prev.id)) {
          await deleteChild(getToken, prev.id);
        }
      }

      for (const row of children) {
        if (!row.firstName.trim() || !row.birthDate) {
          throw new Error('Cada niño necesita nombre y fecha de nacimiento.');
        }
        if (row.id) {
          await patchChild(getToken, row.id, {
            firstName: row.firstName.trim(),
            birthDate: row.birthDate,
            interests: row.interests.trim() || undefined,
            notes: row.notes.trim() || undefined,
          });
        } else {
          await postChild(getToken, {
            firstName: row.firstName.trim(),
            birthDate: row.birthDate,
            interests: row.interests.trim() || undefined,
            notes: row.notes.trim() || undefined,
          });
        }
      }

      return getConsumerProfile(getToken);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['consumer-profile'] });
      await qc.invalidateQueries({ queryKey: bootstrapQueryKey });
    },
  });

  const removeChild = useMutation({
    mutationFn: async (row: ChildRow) => {
      if (row.id) {
        await deleteChild(getToken, row.id);
      }
      return row.clientKey;
    },
    onSuccess: (clientKey) => {
      setChildren((prev) => prev.filter((r) => r.clientKey !== clientKey));
    },
  });

  const busy = useMemo(
    () =>
      save.isPending ||
      removeChild.isPending ||
      profileQuery.isLoading ||
      bootstrapQuery.isLoading,
    [
      save.isPending,
      removeChild.isPending,
      profileQuery.isLoading,
      bootstrapQuery.isLoading,
    ],
  );

  if (profileQuery.isError || bootstrapQuery.isError) {
    return (
      <div className="p-8 text-sm text-red-600">
        No se pudo cargar el perfil.{' '}
        <Link href="/bootstrap" className="underline">
          Reintentar
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <AppHeader
        title="Mi perfil"
        links={[
          { href: '/dashboard/consumer', label: 'Inicio' },
          { href: '/profile/consumer', label: 'Mi perfil' },
        ]}
      />
      <main className="mx-auto max-w-lg space-y-8 p-8">
        <div>
          <h1 className="text-2xl font-semibold">Editar perfil familiar</h1>
          <p className="mt-2 text-sm text-zinc-600">
            Actualiza tus datos y los de tus beneficiarios.
          </p>
        </div>

        <section className="space-y-4 rounded-xl border border-zinc-200 bg-white p-6">
          <Field label="Nombre completo">
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </Field>
          <Field label="Teléfono">
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </Field>
          <Field label="Ciudad">
            <Input value={city} onChange={(e) => setCity(e.target.value)} />
          </Field>
          <Field label="Relación con el niño/a">
            <Input
              value={relationship}
              onChange={(e) => setRelationship(e.target.value)}
            />
          </Field>
        </section>

        <section className="space-y-4 rounded-xl border border-zinc-200 bg-white p-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
              Niños
            </h2>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setChildren((c) => [...c, newRow()])}
            >
              Añadir
            </Button>
          </div>
          {children.map((row) => (
            <div
              key={row.clientKey}
              className="space-y-3 rounded-lg border border-zinc-100 p-4"
            >
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  className="text-red-600"
                  disabled={busy}
                  onClick={() => removeChild.mutate(row)}
                >
                  Quitar
                </Button>
              </div>
              <Field label="Nombre">
                <Input
                  value={row.firstName}
                  onChange={(e) =>
                    setChildren((prev) =>
                      prev.map((r) =>
                        r.clientKey === row.clientKey
                          ? { ...r, firstName: e.target.value }
                          : r,
                      ),
                    )
                  }
                />
              </Field>
              <Field label="Fecha de nacimiento">
                <Input
                  type="date"
                  value={row.birthDate}
                  onChange={(e) =>
                    setChildren((prev) =>
                      prev.map((r) =>
                        r.clientKey === row.clientKey
                          ? { ...r, birthDate: e.target.value }
                          : r,
                      ),
                    )
                  }
                />
              </Field>
              <Field label="Intereses (opcional)">
                <Input
                  value={row.interests}
                  onChange={(e) =>
                    setChildren((prev) =>
                      prev.map((r) =>
                        r.clientKey === row.clientKey
                          ? { ...r, interests: e.target.value }
                          : r,
                      ),
                    )
                  }
                />
              </Field>
              <Field label="Notas (opcional)">
                <Input
                  value={row.notes}
                  onChange={(e) =>
                    setChildren((prev) =>
                      prev.map((r) =>
                        r.clientKey === row.clientKey
                          ? { ...r, notes: e.target.value }
                          : r,
                      ),
                    )
                  }
                />
              </Field>
            </div>
          ))}
        </section>

        {save.isError && (
          <p className="text-sm text-red-600">
            {save.error instanceof Error ? save.error.message : 'Error al guardar'}
          </p>
        )}
        {save.isSuccess && !save.isPending && (
          <p className="text-sm text-emerald-700">Cambios guardados.</p>
        )}

        <Button
          className="w-full py-3"
          disabled={busy}
          onClick={() => save.mutate()}
        >
          Guardar cambios
        </Button>
      </main>
    </div>
  );
}
