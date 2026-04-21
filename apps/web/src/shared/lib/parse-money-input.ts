/**
 * Interpreta un texto de importe en pesos (COP) con formatos habituales en Colombia:
 * - `45000`, `45.000` (miles con punto)
 * - `45000,50` o `45.000,50` (decimales con coma, opcional)
 * - `45000.50` (decimales con punto cuando hay solo un grupo decimal de 1–2 cifras)
 */
export function parseMoneyInputToMajorUnits(raw: string): number {
  const s = raw.trim().replace(/\s/g, '');
  if (!s) return Number.NaN;

  const withCommaDecimal = /^([\d.]+),(\d{1,2})$/.exec(s);
  if (withCommaDecimal) {
    const intPart = withCommaDecimal[1].replace(/\./g, '');
    return Number(`${intPart}.${withCommaDecimal[2]}`);
  }

  if (s.includes('.') && !s.includes(',')) {
    const parts = s.split('.');
    if (parts.length === 2 && parts[1].length > 0 && parts[1].length <= 2) {
      return Number(s);
    }
    return Number(s.replace(/\./g, ''));
  }

  return Number(s.replace(',', '.'));
}
