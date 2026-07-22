/** Money formatting. Amounts render with tabular figures (see .tabular). */

/** Absolute amount, e.g. "€240.00". */
export function euro(value: number): string {
  return `€${Math.abs(value).toFixed(2)}`;
}

/** Signed amount using a true minus sign, e.g. "+€240.00" / "−€85.50". */
export function signedEuro(value: number): string {
  const sign = value > 0 ? '+' : value < 0 ? '−' : '';
  return `${sign}${euro(value)}`;
}

/** Treat sub-cent balances as settled, to avoid float noise showing as debt. */
export function isZero(value: number): boolean {
  return Math.abs(value) < 0.005;
}
