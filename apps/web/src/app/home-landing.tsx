'use client';

import Link from 'next/link';

import { ProviderDiscovery } from '@/features/discover/provider-discovery';
import { PublicSiteHeader } from '@/shared/components/public-site-header';
import { buttonStyles } from '@/shared/components/ui/button';

/** Landing pública (solo invitados): la raíz redirige a `/mi-espacio` si hay sesión. */
export function HomeLanding() {
  return (
    <div className="min-h-screen bg-stone-50">
      <PublicSiteHeader />

      <main>
        <section className="border-b border-stone-200 bg-gradient-to-b from-white to-stone-50">
          <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-800 sm:text-sm">
                Cuidado y educación en casa
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl lg:text-5xl">
                Encuentra profesores y cuidadores de confianza
              </h1>
              <p className="mt-3 text-base leading-snug text-stone-600 sm:text-lg">
                Clases, apoyo escolar y cuidado infantil. Abajo ves perfiles
                reales; filtra sin salir de esta página.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
                <Link href="/sign-in" className={buttonStyles('primary')}>
                  Entrar o registrarse
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section
          id="explorar"
          className="scroll-mt-4 mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10"
        >
          <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-stone-900 sm:text-2xl">
                Educadores y cuidadores
              </h2>
              <p className="text-sm text-stone-600 sm:text-base">
                Filtra aquí mismo; no hace falta otra pantalla.
              </p>
            </div>
          </div>
          <ProviderDiscovery />
        </section>
      </main>

      <footer className="border-t border-stone-200 bg-white py-6">
        <div className="mx-auto max-w-6xl px-4 text-center text-sm text-stone-500 sm:px-6">
          © {new Date().getFullYear()} Trofo School. Todos los derechos
          reservados.
        </div>
      </footer>
    </div>
  );
}
