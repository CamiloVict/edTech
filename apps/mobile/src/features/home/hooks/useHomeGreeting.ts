import { useMemo } from 'react';

/**
 * Hook de una sola responsabilidad: derivar el saludo a mostrar.
 * Sin side effects; fácil de testear.
 */
export function useHomeGreeting(displayName?: string) {
  return useMemo(() => {
    if (displayName?.trim()) {
      return `Hola, ${displayName.trim()}`;
    }
    return 'Bienvenido a Trofo School';
  }, [displayName]);
}
