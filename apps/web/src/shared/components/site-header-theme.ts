/** Estilos compartidos entre `PublicSiteHeader` y `AppHeader`. */

export const siteHeaderBarClass =
  'sticky top-0 z-50 border-b border-border bg-card/90 shadow-sm backdrop-blur-md';

export const siteHeaderInnerClass =
  'mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6';

/** Enlaces secundarios del menú (Educadores, Mi perfil, etc.). */
export const siteHeaderNavLinkClass =
  'rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground';

/** Enlace principal destacado (Mi panel). */
export const siteHeaderNavLinkEmphasisClass =
  'rounded-lg px-3 py-2 text-sm font-semibold text-primary transition hover:bg-muted';

export const siteHeaderUserWrapClass =
  'ml-1 flex items-center border-l border-border pl-2 sm:pl-3';

export const siteHeaderPageLabelClass =
  'hidden text-sm font-medium text-muted-foreground sm:inline sm:max-w-[10rem] sm:truncate md:max-w-none';
