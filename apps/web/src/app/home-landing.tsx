'use client';

import Link from 'next/link';

import { FormativePlansSection } from '@/features/home/formative-plans-section';
import { ProviderDiscovery } from '@/features/discover/provider-discovery';
import { PublicSiteHeader } from '@/shared/components/public-site-header';
import { buttonStyles } from '@/shared/components/ui/button';

/** Home en `/`: landing con nosotros, educadores y planes formativos (todos los visitantes). */
export function HomeLanding() {
  return (
    <div className="min-h-screen bg-stone-50">
      <PublicSiteHeader />

      <main>
        <section className="border-b border-stone-200 bg-gradient-to-b from-white to-stone-50">
          <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-800 sm:text-sm">
                Trofo School
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl lg:text-5xl">
                Educación y cuidado de calidad, cerca de tu familia
              </h1>
              <p className="mt-4 text-base leading-relaxed text-stone-600 sm:text-lg">
                Conectamos familias con educadores y cuidadores verificados para
                apoyo escolar, idiomas y acompañamiento en casa, con procesos
                claros y respeto por el ritmo de cada niño o niña.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
                <Link href="/sign-in" className={buttonStyles('primary')}>
                  Entrar o registrarse
                </Link>
                <a
                  href="#explorar"
                  className={buttonStyles('secondary')}
                >
                  Ver educadores
                </a>
                <a
                  href="#planes"
                  className={buttonStyles(
                    'ghost',
                    'border border-stone-200 bg-white/80',
                  )}
                >
                  Planes formativos
                </a>
              </div>
            </div>
          </div>
        </section>

        <section
          id="nosotros"
          className="scroll-mt-4 border-b border-stone-200 bg-white py-12 sm:py-16"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
              <div>
                <h2 className="text-2xl font-bold text-stone-900 sm:text-3xl">
                  Quiénes somos
                </h2>
                <div className="mt-4 space-y-4 text-sm leading-relaxed text-stone-600 sm:text-base">
                  <p>
                    <strong className="text-stone-800">Trofo School</strong> es
                    una plataforma pensada para familias que buscan apoyo
                    educativo y cuidado infantil con confianza: un mismo lugar
                    para descubrir perfiles, conocer tarifas con sesión iniciada,
                    coordinar disponibilidad y citas con educadores.
                  </p>
                  <p>
                    Nacimos de la necesidad de acercar el talento docente y de
                    cuidado al hogar, sin perder la calidez de un trato personal.
                    Trabajamos con perfiles públicos transparentes y flujos que
                    respetan el tiempo de las familias y de quienes enseñan o
                    cuidan.
                  </p>
                </div>
              </div>
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-6 sm:p-8">
                <h2 className="text-2xl font-bold text-stone-900 sm:text-3xl">
                  Qué queremos ser
                </h2>
                <div className="mt-4 space-y-4 text-sm leading-relaxed text-stone-700 sm:text-base">
                  <p>
                    Queremos ser el referente en{' '}
                    <strong className="text-stone-900">
                      acompañamiento formativo en el entorno familiar
                    </strong>
                    : donde cada familia encuentre al profesional adecuado y cada
                    educador gestione con claridad su oferta, disponibilidad y
                    relación con quienes confían en su trabajo.
                  </p>
                  <p>
                    Aspiramos a integrar{' '}
                    <strong className="text-stone-900">
                      planes formativos estructurados
                    </strong>{' '}
                    (como los que ves más abajo), seguimiento por beneficiario y,
                    en el futuro, suscripciones alineadas a objetivos de
                    aprendizaje — siempre con la familia en el centro.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="explorar"
          className="scroll-mt-4 mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12"
        >
          <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-stone-900 sm:text-2xl">
                Educadores y cuidadores
              </h2>
              <p className="mt-1 text-sm text-stone-600 sm:text-base">
                Pulsa una tarjeta para abrir la ficha completa. Las tarifas y la
                reserva están en el perfil (con sesión y perfil de familia
                completo).
              </p>
            </div>
            <Link
              href="/explorar"
              className="text-sm font-semibold text-emerald-900 underline decoration-emerald-800/30 underline-offset-2 hover:decoration-emerald-800"
            >
              Abrir solo esta sección
            </Link>
          </div>
          <ProviderDiscovery />
        </section>

        <FormativePlansSection />
      </main>

      <footer className="border-t border-stone-200 bg-white py-8">
        <div className="mx-auto max-w-6xl px-4 text-center text-sm text-stone-500 sm:px-6">
          <p className="font-medium text-stone-700">Trofo School</p>
          <p className="mt-2">
            © {new Date().getFullYear()} Trofo School. Todos los derechos
            reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
