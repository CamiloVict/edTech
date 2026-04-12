import Link from 'next/link';
import type { ReactNode } from 'react';

import { SiteLogo } from '@/shared/components/site-logo';

export function HelpCallout({
  title,
  children,
  compact,
}: {
  title: string;
  children: ReactNode;
  /** Una sola línea visual: menos scroll. */
  compact?: boolean;
}) {
  if (compact) {
    return (
      <aside
        className="rounded-xl border border-emerald-200/80 bg-emerald-50/90 px-3 py-2 text-sm text-emerald-950"
        role="note"
      >
        <span className="font-semibold text-emerald-900">{title}: </span>
        <span className="text-emerald-900/90">{children}</span>
      </aside>
    );
  }
  return (
    <aside
      className="rounded-xl border border-emerald-200/80 bg-emerald-50/90 px-3 py-2.5 text-sm leading-snug text-emerald-950"
      role="note"
    >
      <p className="font-semibold text-emerald-900">{title}</p>
      <div className="mt-1 text-emerald-900/90">{children}</div>
    </aside>
  );
}

export function StepIndicator({
  steps,
  current,
}: {
  steps: { label: string }[];
  current: number;
}) {
  return (
    <nav
      aria-label="Pasos del formulario"
      className="mb-4 rounded-xl border border-stone-200 bg-white px-3 py-3 shadow-sm"
    >
      <ol className="flex items-start justify-between gap-1 sm:gap-3">
        {steps.map((s, i) => {
          const n = i + 1;
          const done = n < current;
          const active = n === current;
          return (
            <li
              key={s.label}
              className="flex min-w-0 flex-1 flex-col items-center gap-1 text-center"
            >
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold sm:h-9 sm:w-9 sm:text-sm ${
                  done
                    ? 'bg-emerald-800 text-white'
                    : active
                      ? 'bg-emerald-100 text-emerald-900 ring-2 ring-emerald-600 ring-offset-1'
                      : 'bg-stone-200 text-stone-600'
                }`}
                aria-current={active ? 'step' : undefined}
              >
                {done ? '✓' : n}
              </span>
              <span
                className={`line-clamp-2 text-[11px] font-semibold leading-tight sm:text-xs ${
                  active ? 'text-stone-900' : 'text-stone-500'
                }`}
              >
                {s.label}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export function FriendlyFormShell({
  title,
  subtitle,
  topBar = true,
  steps,
  currentStep,
  children,
  footer,
  maxWidthClass = 'max-w-2xl',
}: {
  title: string;
  subtitle: ReactNode;
  topBar?: boolean;
  steps?: { label: string }[];
  currentStep?: number;
  children: ReactNode;
  /** Barra fija en móvil: el botón principal siempre a la vista (menos scroll). */
  footer?: ReactNode;
  maxWidthClass?: string;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/70 via-stone-50 to-stone-100">
      {topBar ? (
        <div className="border-b border-stone-200/80 bg-white/90 backdrop-blur-sm">
          <div
            className={`mx-auto flex ${maxWidthClass} items-center justify-between px-4 py-2.5 sm:px-6`}
          >
            <SiteLogo href="/" />
            <Link
              href="/"
              className="text-sm font-medium text-stone-600 hover:text-emerald-800"
            >
              Inicio
            </Link>
          </div>
        </div>
      ) : null}
      <main
        className={`mx-auto ${maxWidthClass} px-4 py-5 sm:px-6 sm:py-8 ${footer ? 'pb-28 sm:pb-8' : ''}`}
      >
        {steps && currentStep != null ? (
          <StepIndicator steps={steps} current={currentStep} />
        ) : null}
        <header className="mb-4 text-center sm:mb-5 sm:text-left">
          <h1 className="text-xl font-bold tracking-tight text-stone-900 sm:text-2xl">
            {title}
          </h1>
          <div className="mt-2 text-sm leading-snug text-stone-600 sm:text-base">
            {subtitle}
          </div>
        </header>
        <div className="space-y-4 sm:space-y-5">{children}</div>
        {footer ? (
          <div className="mt-5 hidden sm:block">{footer}</div>
        ) : null}
      </main>
      {footer ? (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-stone-200 bg-white/95 p-3 shadow-[0_-6px_24px_rgba(0,0,0,0.08)] backdrop-blur-md sm:hidden">
          <div className={`mx-auto ${maxWidthClass} px-4`}>{footer}</div>
        </div>
      ) : null}
    </div>
  );
}

/** Pantalla de acceso (Clerk): columna amable + formulario claro en móvil y escritorio. */
export function AuthGateShell({
  title,
  subtitle,
  bullets,
  children,
}: {
  title: string;
  subtitle: string;
  bullets: string[];
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50/90 via-white to-stone-100">
      <div className="mx-auto grid min-h-screen max-w-6xl lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <aside className="relative hidden flex-col justify-center gap-6 border-stone-200/80 px-10 py-12 lg:flex lg:border-r">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-emerald-100/80 via-transparent to-transparent" />
          <div className="relative">
            <SiteLogo href="/" />
            <h1 className="mt-10 text-3xl font-bold leading-tight tracking-tight text-stone-900">
              {title}
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-stone-600">
              {subtitle}
            </p>
            <ul className="mt-8 space-y-4 text-base text-stone-700">
              {bullets.map((b) => (
                <li key={b} className="flex gap-3">
                  <span
                    className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-800 text-xs font-bold text-white"
                    aria-hidden
                  >
                    ✓
                  </span>
                  <span className="leading-snug">{b}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/"
              className="mt-10 inline-flex text-sm font-semibold text-emerald-800 hover:text-emerald-950"
            >
              ← Volver a la página principal
            </Link>
          </div>
        </aside>
        <div className="flex flex-col items-center justify-start px-4 py-8 sm:justify-center sm:py-10">
          <div className="mb-6 w-full max-w-md lg:hidden">
            <SiteLogo href="/" />
          </div>
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-xl shadow-stone-300/25">
            {children}
          </div>
          <p className="mt-6 max-w-md text-center text-sm leading-relaxed text-stone-600 lg:hidden">
            {subtitle}
          </p>
          <Link
            href="/"
            className="mt-4 text-sm font-medium text-emerald-800 lg:hidden"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
