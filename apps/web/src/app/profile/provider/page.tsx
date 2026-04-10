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
  getProviderProfile,
  patchProviderProfile,
} from '@/features/provider/api/provider-api';
import type { ProviderKind, ServiceMode } from '@/shared/types/bootstrap';
import { AppHeader } from '@/shared/components/app-header';
import { Button } from '@/shared/components/ui/button';
import { Field, Input, Select, TextArea } from '@/shared/components/ui/field';

const modes: { value: ServiceMode; label: string }[] = [
  { value: 'IN_PERSON', label: 'Presencial' },
  { value: 'ONLINE', label: 'En línea' },
  { value: 'HYBRID', label: 'Híbrido' },
];

export default function ProviderProfilePage() {
  const { getToken } = useAuth();
  const router = useRouter();
  const qc = useQueryClient();

  const bootstrapQuery = useQuery({
    queryKey: bootstrapQueryKey,
    queryFn: () => fetchBootstrap(getToken),
  });

  const profileQuery = useQuery({
    queryKey: ['provider-profile'],
    queryFn: () => getProviderProfile(getToken),
    enabled: bootstrapQuery.data?.user.role === 'PROVIDER',
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
  const [isAvailable, setIsAvailable] = useState(true);

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
    setIsAvailable(p.isAvailable);
  }, [profileQuery.data]);

  useEffect(() => {
    const b = bootstrapQuery.data;
    if (!b) return;
    if (b.needsRoleSelection) {
      router.replace('/role');
      return;
    }
    if (b.user.role !== 'PROVIDER') {
      router.replace('/dashboard/consumer');
      return;
    }
    if (b.needsOnboarding) {
      router.replace('/onboarding/provider');
    }
  }, [bootstrapQuery.data, router]);

  const save = useMutation({
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
      return patchProviderProfile(getToken, {
        fullName,
        bio,
        yearsOfExperience: Number(years),
        focusAreas,
        serviceMode: serviceMode as ServiceMode,
        city,
        photoUrl: photoUrl.trim() || undefined,
        availabilitySummary: availabilitySummary.trim() || undefined,
        kinds,
        isAvailable,
      });
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['provider-profile'] });
      await qc.invalidateQueries({ queryKey: bootstrapQueryKey });
    },
  });

  const busy = useMemo(
    () =>
      save.isPending || profileQuery.isLoading || bootstrapQuery.isLoading,
    [save.isPending, profileQuery.isLoading, bootstrapQuery.isLoading],
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
          { href: '/dashboard/provider', label: 'Inicio' },
          { href: '/profile/provider', label: 'Mi perfil' },
        ]}
      />
      <main className="mx-auto max-w-lg space-y-8 p-8">
        <div>
          <h1 className="text-2xl font-semibold">Editar perfil profesional</h1>
          <p className="mt-2 text-sm text-zinc-600">
            Mantén tu información al día para generar confianza con las familias.
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
            <Input value={focus} onChange={(e) => setFocus(e.target.value)} />
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
        <Field label="Disponibilidad (texto libre)">
          <TextArea
            value={availabilitySummary}
            onChange={(e) => setAvailabilitySummary(e.target.value)}
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
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isAvailable}
              onChange={(e) => setIsAvailable(e.target.checked)}
            />
            Aparecer como disponible en el listado público
          </label>
        </div>
        <p className="text-xs text-zinc-500">
          Valoración mostrada:{' '}
          {(profileQuery.data?.averageRating ?? 0).toFixed(1)} (
          {profileQuery.data?.ratingCount ?? 0} valoraciones) — en el futuro
          vendrá de reseñas reales.
        </p>
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
