'use client';

const iconClass = 'h-5 w-5';

export function SiteHeaderHamburgerButton({
  open,
  menuId,
  onClick,
}: {
  open: boolean;
  menuId: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-foreground outline-none transition hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary/35 sm:hidden"
      aria-expanded={open}
      aria-controls={menuId}
      aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
      onClick={onClick}
    >
      {open ? (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M6 6L18 18M18 6L6 18"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      ) : (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M4 7H20M4 12H20M4 17H20"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      )}
    </button>
  );
}
