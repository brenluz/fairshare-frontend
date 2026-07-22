/**
 * Deterministic per-member visuals, so the same person/group looks identical on
 * every screen. Keyed by a stable string (email for members, name for groups).
 */

// The handoff's member palette (Maya / Theo / Priya / Sam) plus the accent.
const COLORS = ['#6D62E8', '#E0A25A', '#C77FA6', '#5FA487', '#5A50E6'];

// Group icons are gradient rounded squares (135°).
const GRADIENTS: ReadonlyArray<readonly [string, string]> = [
  ['#6D62E8', '#8E86F0'],
  ['#E0A25A', '#EDBE84'],
  ['#C77FA6', '#DAA1C0'],
  ['#5FA487', '#83C0A6'],
  ['#5A50E6', '#8079EE'],
];

function bucket(key: string, size: number): number {
  let hash = 0;
  for (const ch of key) hash = (hash + ch.charCodeAt(0)) % size;
  return hash;
}

export function avatarColor(key: string): string {
  return COLORS[bucket(key, COLORS.length)];
}

export function avatarGradient(key: string): string {
  const [from, to] = GRADIENTS[bucket(key, GRADIENTS.length)];
  return `linear-gradient(135deg, ${from}, ${to})`;
}

/** Two-letter uppercase initials for member avatars. */
export function initials(name: string | undefined): string {
  return (name ?? '?').trim().slice(0, 2).toUpperCase();
}

/** Single uppercase initial for group icons. */
export function initial(name: string | undefined): string {
  return ((name ?? '?').trim()[0] ?? '?').toUpperCase();
}
