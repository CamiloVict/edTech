'use client';

import type { ReactNode } from 'react';

export function SiteHeaderMobilePanel({
  open,
  menuId,
  headerHeight,
  onClose,
  children,
}: {
  open: boolean;
  menuId: string;
  headerHeight: number;
  onClose: () => void;
  children: ReactNode;
}) {
  if (!open) return null;

  return (
    <>
      <button
        type="button"
        className="fixed inset-x-0 bottom-0 z-60 cursor-default border-0 bg-black/45 p-0 sm:hidden"
        style={{ top: headerHeight }}
        aria-label="Cerrar menú"
        onClick={onClose}
      />
      <nav
        id={menuId}
        className="absolute left-0 right-0 z-70 overflow-y-auto border-b border-border bg-card px-2 py-2 shadow-lg sm:hidden"
        style={{
          top: '100%',
          maxHeight: `min(calc(100dvh - ${headerHeight}px), 85vh)`,
        }}
      >
        <div className="flex flex-col gap-0.5">{children}</div>
      </nav>
    </>
  );
}
