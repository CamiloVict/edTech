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
import {
  FriendlyFormShell,
  HelpCallout,
} from '@/shared/components/friendly-form-shell';
import { Button } from '@/shared/components/ui/button';
import { Field, Input, Select, TextArea } from '@/shared/components/ui/field';

const modes: { value: ServiceMode; label: string }[] = [
  { value: 'IN_PERSON', label: 'Presencial' },
  { value: 'ONLINE', label: 'En línea' },
  { value: 'HYBRID', label: 'Presencial y en línea' },
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
        throw new Error(
          'Faltan años de experiencia o la modalidad (presencial / en línea). Revísalo en el paso 1.',
        );
      }
      const kinds: ProviderKind[] = [];
      if (kindTeacher) kinds.push('TEACHER');
      if (kindBabysitter) kinds.push('BABYSITTER');
      if (kinds.length === 0) {
        throw new Error(
          'Marca al menos una casilla: educación o cuidado infantil.',
        );
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
      <div className="mx-auto max-w-lg p-8 text-base text-red-700">
        No pudimos cargar esta pantalla.{' '}
        <Link href="/mi-espacio" className="font-semibold underline">
          Intentar de nuevo
        </Link>
      </div>
    );
  }

  return (
    <FriendlyFormShell
      maxWidthClass="max-w-3xl"
      title="Tu perfil profesional"
      subtitle="Un solo formulario. Las familias lo leen antes de escribirte; edítalo cuando quieras en Mi perfil."
      footer={
        <Button
          className="w-full py-3.5 text-base"
          disabled={busy}
          onClick={() => submit.mutate()}
        >
          {busy ? 'Guardando…' : 'Guardar y continuar'}
        </Button>
      }
    >
      <HelpCallout title="Tip" compact>
        Lenguaje sencillo y frases cortas. Puedes marcar educación y cuidado a la
        vez.
      </HelpCallout>

      <section className="space-y-4 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-4 lg:col-span-2">
            <h2 className="text-base font-bold text-stone-900">Sobre ti</h2>
            <Field label="Nombre público">
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </Field>
            <Field label="Descripción (bio)">
              <TextArea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Experiencia, edades, cómo trabajas…"
                rows={4}
              />
            </Field>
          </div>
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
          <Field label="Ciudad">
            <Input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Ej. Medellín"
            />
          </Field>
          <div className="lg:col-span-2">
            <Field label="Especialidades (separadas por coma)">
              <Input
                value={focus}
                onChange={(e) => setFocus(e.target.value)}
                placeholder="Estimulación, inglés, tareas…"
              />
            </Field>
          </div>
          <div className="lg:col-span-2">
            <Field label="Modalidad">
              <Select
                value={serviceMode}
                onChange={(e) =>
                  setServiceMode(e.target.value as ServiceMode | '')
                }
              >
                <option value="">Elige…</option>
                {modes.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
        </div>

        <div className="border-t border-stone-100 pt-4">
          <h2 className="mb-3 text-base font-bold text-stone-900">
            ¿Qué ofreces? (marca una o dos)
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <label
              className={`flex min-h-[4.5rem] cursor-pointer items-center gap-3 rounded-xl border-2 p-3 transition ${
                kindTeacher
                  ? 'border-emerald-600 bg-emerald-50/60'
                  : 'border-stone-200 bg-white hover:border-stone-300'
              }`}
            >
              <input
                type="checkbox"
                className="h-5 w-5 shrink-0 rounded border-stone-300 text-emerald-800"
                checked={kindTeacher}
                onChange={(e) => setKindTeacher(e.target.checked)}
              />
              <span className="text-sm font-bold leading-tight text-stone-900">
                Clases / educación
              </span>
            </label>
            <label
              className={`flex min-h-[4.5rem] cursor-pointer items-center gap-3 rounded-xl border-2 p-3 transition ${
                kindBabysitter
                  ? 'border-emerald-600 bg-emerald-50/60'
                  : 'border-stone-200 bg-white hover:border-stone-300'
              }`}
            >
              <input
                type="checkbox"
                className="h-5 w-5 shrink-0 rounded border-stone-300 text-emerald-800"
                checked={kindBabysitter}
                onChange={(e) => setKindBabysitter(e.target.checked)}
              />
              <span className="text-sm font-bold leading-tight text-stone-900">
                Cuidado / babysitting
              </span>
            </label>
          </div>
        </div>

        <div className="border-t border-stone-100 pt-4">
          <h2 className="mb-3 text-base font-bold text-stone-900">
            Foto y disponibilidad
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Field label="Enlace de foto (opcional)">
                <Input
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="https://…"
                />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field label="Disponibilidad">
                <TextArea
                  value={availabilitySummary}
                  onChange={(e) => setAvailabilitySummary(e.target.value)}
                  placeholder="Ej. Mañanas lun–vie"
                  rows={3}
                />
              </Field>
            </div>
          </div>
        </div>
      </section>

      {submit.isError ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-800">
          {submit.error instanceof Error
            ? submit.error.message
            : 'No se pudo guardar. Revisa la conexión.'}
        </p>
      ) : null}
    </FriendlyFormShell>
  );
}
