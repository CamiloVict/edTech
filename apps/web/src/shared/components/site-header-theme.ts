/** Estilos compartidos entre `PublicSiteHeader` y `AppHeader`. */

export const siteHeaderBarClass =
  'sticky top-0 z-50 border-b border-stone-200/90 bg-white/90 shadow-sm backdrop-blur-md';

export const siteHeaderInnerClass =
  'mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6';

/** Enlaces secundarios del menú (Educadores, Mi perfil, etc.). */
export const siteHeaderNavLinkClass =
  'rounded-lg px-3 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-100 hover:text-stone-900';

/** Enlace principal destacado (Mi panel). */
export const siteHeaderNavLinkEmphasisClass =
  'rounded-lg px-3 py-2 text-sm font-semibold text-emerald-900 transition hover:bg-emerald-50';

export const siteHeaderUserWrapClass =
  'ml-1 flex items-center border-l border-stone-200 pl-2 sm:pl-3';

export const siteHeaderPageLabelClass =
  'hidden text-sm font-medium text-stone-400 sm:inline sm:max-w-[10rem] sm:truncate md:max-w-none';
