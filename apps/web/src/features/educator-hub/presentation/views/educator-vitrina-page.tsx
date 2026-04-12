'use client';

import Link from 'next/link';

import type {
  EducatorBadge,
  EducatorProfile,
  EducatorReview,
  ProfileCompletionItem,
} from '@/features/educator-hub/domain/types';
import {
  formatAgeBands,
  formatMoneyMinor,
  formatServiceMode,
} from '@/features/educator-hub/application/educator-format';
import { buttonStyles } from '@/shared/components/ui/button';

export function EducatorVitrinaPage({
  profile,
  reviews,
  badges,
  completion,
  publicProfileId,
}: {
  profile: EducatorProfile;
  reviews: EducatorReview[];
  badges: EducatorBadge[];
  completion: { scorePercent: number; items: ProfileCompletionItem[] };
  publicProfileId: string | null;
}) {
  const pending = completion.items.filter((i) => !i.done);

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)] sm:text-3xl">Vitrina publica</h1>
          <p className="mt-2 max-w-2xl text-sm text-[var(--muted-foreground)]">
            Asi te ven las familias. Datos enriquecidos demo; nombre y foto pueden venir de tu cuenta real.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:items-end">
          <Link href="/profile/provider" className={buttonStyles('secondary', 'rounded-xl text-center')}>
            Editar perfil real
          </Link>
          {publicProfileId ? (
            <Link
              href={`/educadores/${publicProfileId}`}
              className="text-sm font-medium text-[var(--primary-soft)] underline-offset-2 hover:underline"
            >
              Abrir URL publica
            </Link>
          ) : null}
        </div>
      </header>

      <div className="overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
        <div className="grid gap-0 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
          <div className="relative min-h-[280px] bg-[var(--primary)] p-8 text-white lg:min-h-[360px]">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
              <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-2xl border-4 border-white/20 bg-white/10">
                {profile.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profile.photoUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm opacity-70">Sin foto</div>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-white/80">Educador en Edify</p>
                <h2 className="mt-1 text-2xl font-bold sm:text-3xl">{profile.fullName}</h2>
                <p className="mt-2 text-base text-white/90">{profile.headline}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {badges
                    .filter((b) => b.earned)
                    .map((b) => (
                      <span
                        key={b.id}
                        className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur"
                      >
                        {b.label}
                      </span>
                    ))}
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-center gap-4 p-8">
            <p className="text-sm leading-relaxed text-[var(--muted-foreground)]">{profile.bioShort}</p>
            <div className="flex flex-wrap gap-3 text-sm">
              <span className="rounded-xl bg-[var(--muted)] px-3 py-2 font-medium">
                Desde {formatMoneyMinor(profile.priceFromMinor, profile.currency)} / sesion
              </span>
              <span className="rounded-xl bg-[var(--muted)] px-3 py-2">
                {formatServiceMode(profile.serviceMode)}
              </span>
              <span className="rounded-xl bg-[var(--muted)] px-3 py-2">
                Edades: {formatAgeBands(profile.ageBands)}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" className={buttonStyles('primary', 'rounded-xl !bg-[var(--accent)] !text-[var(--primary)]')}>
                Reservar o contactar
              </button>
              <span className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm text-[var(--muted-foreground)]">
                Video presentacion (proximamente)
              </span>
            </div>
          </div>
        </div>

        <div className="grid gap-6 border-t border-[var(--border)] p-8 lg:grid-cols-3">
          <section className="lg:col-span-2">
            <h3 className="text-base font-semibold text-[var(--foreground)]">Sobre mi</h3>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-[var(--muted-foreground)]">
              {profile.bioLong}
            </p>
            <h3 className="mt-8 text-base font-semibold text-[var(--foreground)]">Metodologia</h3>
            <p className="mt-3 text-sm leading-relaxed text-[var(--muted-foreground)]">{profile.methodology}</p>
          </section>
          <aside className="space-y-4 rounded-2xl bg-[var(--muted)]/50 p-5">
            <h3 className="text-sm font-semibold text-[var(--foreground)]">Completitud del perfil</h3>
            <p className="text-3xl font-bold text-[var(--primary)]">{completion.scorePercent}%</p>
            <ul className="space-y-2 text-sm">
              {pending.slice(0, 4).map((i) => (
                <li key={i.id} className="rounded-lg bg-amber-50/90 px-2 py-1.5 text-amber-950">
                  Mejora: {i.label} ({i.impactLabel})
                </li>
              ))}
            </ul>
            <p className="text-xs text-[var(--muted-foreground)]">
              Agregar video mejora la conversion. Completa metodologia y paquetes para generar mas confianza.
            </p>
          </aside>
        </div>

        <div className="grid gap-6 border-t border-[var(--border)] p-8 sm:grid-cols-2">
          <section>
            <h3 className="text-base font-semibold text-[var(--foreground)]">Especialidades y categorias</h3>
            <ul className="mt-3 flex flex-wrap gap-2">
              {profile.focusAreas.map((f) => (
                <li key={f} className="rounded-full bg-[var(--muted)] px-3 py-1 text-sm">
                  {f}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-sm text-[var(--muted-foreground)]">{profile.categories.join(' · ')}</p>
            <p className="mt-4 text-sm text-[var(--muted-foreground)]">
              <span className="font-semibold text-[var(--foreground)]">Idiomas: </span>
              {profile.languages.join(', ')}
            </p>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">
              <span className="font-semibold text-[var(--foreground)]">Certificaciones: </span>
              {profile.certifications.join('; ')}
            </p>
          </section>
          <section>
            <h3 className="text-base font-semibold text-[var(--foreground)]">Ubicacion y disponibilidad</h3>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">
              {profile.city ?? 'Ciudad'} · {profile.zones.join(', ')}
            </p>
            <p className="mt-3 rounded-xl bg-[var(--accent-soft)]/25 p-3 text-sm text-[var(--foreground)]">
              {profile.availabilitySummary}
            </p>
            <p className="mt-3 text-sm text-[var(--muted-foreground)]">
              {profile.yearsOfExperience} anos de experiencia · {profile.averageRating.toFixed(1)} estrellas (
              {profile.ratingCount} opiniones)
            </p>
          </section>
        </div>

        <div className="border-t border-[var(--border)] p-8">
          <h3 className="text-base font-semibold text-[var(--foreground)]">Galeria</h3>
          <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {profile.galleryUrls.map((url) => (
              <li key={url} className="aspect-video overflow-hidden rounded-xl bg-[var(--muted)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="h-full w-full object-cover" />
              </li>
            ))}
          </ul>
        </div>

        <div className="border-t border-[var(--border)] p-8">
          <h3 className="text-base font-semibold text-[var(--foreground)]">Resenas</h3>
          <ul className="mt-4 space-y-4">
            {reviews.map((r) => (
              <li key={r.id} className="rounded-xl border border-[var(--border)] p-4">
                <div className="flex justify-between gap-2">
                  <span className="font-medium text-[var(--foreground)]">{r.authorName}</span>
                  <span className="text-amber-700">{r.rating} estrellas</span>
                </div>
                <p className="mt-2 text-sm text-[var(--muted-foreground)]">{r.excerpt}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
