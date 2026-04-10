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
  completeProviderOnboarding,
  getProviderProfile,
  patchProviderProfile,
} from '@/features/provider/api/provider-api';
import type { ProviderKind, ServiceMode } from '@/shared/types/bootstrap';
import { pathAfterBootstrap } from '@/shared/lib/routing';
import { Button } from '@/shared/components/ui/button';
import { Field, Input, Select, TextArea } from '@/shared/components/ui/field';

const modes: { value: ServiceMode; label: string }[] = [
  { value: 'IN_PERSON', label: 'Presencial' },
  { value: 'ONLINE', label: 'En línea' },
  { value: 'HYBRID', label: 'Híbrido' },
];

export default function ProviderOnboardingPage() {
  const { getToken } = useAuth();
  const router = useRouter();
  const qc = useQueryClient();

  const profileQuery = useQuery({
    queryKey: ['provider-profile'],
    queryFn: () => getProviderProfile(getToken),
  });

  const bootstrapQuery = useQuery({
    queryKey: bootstrapQueryKey,
    queryFn: () => fetchBootstrap(getToken),
  });

  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [years, setYears] = useState<number | ''>('');
  const [focus, setFocus] = useState('');
  const [serviceMode, setServiceMode] = useState<ServiceMode | ''>('');
  const [city, setCity] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [availabilitySummary, setAvailabilitySummary] = useState('');
  const [kindTeacher, setKindTeacher] = useState(true);
  const [kindBabysitter, setKindBabysitter] = useState(false);

  useEffect(() => {
    const p = profileQuery.data;
    if (!p) return;
    setFullName(p.fullName ?? '');
    setBio(p.bio ?? '');
    setYears(p.yearsOfExperience ?? '');
    setFocus(p.focusAreas.join(', '));
    setServiceMode(p.serviceMode ?? '');
    setCity(p.city ?? '');
    setPhotoUrl(p.photoUrl ?? '');
    setAvailabilitySummary(p.availabilitySummary ?? '');
    setKindTeacher(p.kinds.includes('TEACHER'));
    setKindBabysitter(p.kinds.includes('BABYSITTER'));
  }, [profileQuery.data]);

  const bootstrap = bootstrapQuery.data;

  useEffect(() => {
    if (!bootstrap) return;
    if (bootstrap.needsRoleSelection) {
      router.replace('/role');
      return;
    }
    if (bootstrap.user.role !== 'PROVIDER') {
      router.replace('/dashboard/consumer');
      return;
    }
    if (!bootstrap.needsOnboarding) {
      router.replace('/dashboard/provider');
    }
  }, [bootstrap, router]);

  const submit = useMutation({
    mutationFn: async () => {
      const focusAreas = focus
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      if (years === '' || serviceMode === '') {
        throw new Error('Completa años de experiencia y modalidad.');
      }
      const kinds: ProviderKind[] = [];
      if (kindTeacher) kinds.push('TEACHER');
      if (kindBabysitter) kinds.push('BABYSITTER');
      if (kinds.length === 0) {
        throw new Error('Selecciona al menos un tipo: docente o babysitter.');
      }
      await patchProviderProfile(getToken, {
        fullName,
        bio,
        yearsOfExperience: Number(years),
        focusAreas,
        serviceMode: serviceMode as ServiceMode,
        city,
        photoUrl: photoUrl.trim() || undefined,
        availabilitySummary: availabilitySummary.trim() || undefined,
        kinds,
      });
      await completeProviderOnboarding(getToken);
      return fetchBootstrap(getToken);
    },
    onSuccess: async (b) => {
      qc.setQueryData(bootstrapQueryKey, b);
      await qc.invalidateQueries({ queryKey: ['provider-profile'] });
      router.replace(pathAfterBootstrap(b));
    },
  });

  const busy = useMemo(
    () =>
      submit.isPending || profileQuery.isLoading || bootstrapQuery.isLoading,
    [submit.isPending, profileQuery.isLoading, bootstrapQuery.isLoading],
  );

  if (profileQuery.isError || bootstrapQuery.isError) {
    return (
      <div className="mx-auto max-w-lg p-8 text-sm text-red-600">
        No se pudo cargar el onboarding.{' '}
        <Link href="/bootstrap" className="underline">
          Volver a sincronizar
        </Link>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-lg space-y-8 p-8">
      <div>
        <h1 className="text-2xl font-semibold">Perfil profesional</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Cuéntanos cómo acompañas a las familias. Podrás refinar esto más adelante.
        </p>
      </div>

      <section className="space-y-4 rounded-xl border border-zinc-200 bg-white p-6">
        <Field label="Nombre completo">
          <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </Field>
        <Field label="Bio">
          <TextArea value={bio} onChange={(e) => setBio(e.target.value)} />
        </Field>
        <Field label="Años de experiencia">
          <Input
            type="number"
            min={0}
            max={80}
            value={years === '' ? '' : String(years)}
            onChange={(e) => {
              const v = e.target.value;
              setYears(v === '' ? '' : Number(v));
            }}
          />
        </Field>
        <Field label="Especialidades / enfoque (separadas por coma)">
          <Input
            value={focus}
            onChange={(e) => setFocus(e.target.value)}
            placeholder="Ej. estimulación temprana, música"
          />
        </Field>
        <Field label="Modalidad de servicio">
          <Select
            value={serviceMode}
            onChange={(e) =>
              setServiceMode(e.target.value as ServiceMode | '')
            }
          >
            <option value="">Selecciona…</option>
            {modes.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Ciudad">
          <Input value={city} onChange={(e) => setCity(e.target.value)} />
        </Field>
        <Field label="Foto (URL)">
          <Input
            value={photoUrl}
            onChange={(e) => setPhotoUrl(e.target.value)}
            placeholder="https://…"
          />
        </Field>
        <Field label="Disponibilidad (texto libre por ahora)">
          <TextArea
            value={availabilitySummary}
            onChange={(e) => setAvailabilitySummary(e.target.value)}
            placeholder="Ej. Mañanas lun–vie; tardes con cita previa"
          />
        </Field>
        <div className="space-y-2">
          <span className="text-sm font-medium text-zinc-700">
            ¿Qué ofreces?
          </span>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={kindTeacher}
              onChange={(e) => setKindTeacher(e.target.checked)}
            />
            Docente / educación
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={kindBabysitter}
              onChange={(e) => setKindBabysitter(e.target.checked)}
            />
            Babysitter / cuidado
          </label>
        </div>
      </section>

      {submit.isError && (
        <p className="text-sm text-red-600">
          {submit.error instanceof Error
            ? submit.error.message
            : 'Error al guardar'}
        </p>
      )}

      <Button
        className="w-full py-3"
        disabled={busy}
        onClick={() => submit.mutate()}
      >
        Guardar y continuar
      </Button>
    </main>
  );
}
