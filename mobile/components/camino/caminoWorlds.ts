import type { ThemeColors } from '@/constants/theme';

export const CAMINO_WORLDS = [
  { number: 1, titleKey: 'energy', icon: 'university', accentKey: 'kingdom' },
  { number: 2, titleKey: 'safety', icon: 'exclamation-triangle', accentKey: 'alerts' },
  { number: 3, titleKey: 'carbohydrates', icon: 'cutlery', accentKey: 'nutrition' },
  { number: 4, titleKey: 'insulin', icon: 'medkit', accentKey: 'insulin' },
  { number: 5, titleKey: 'explorer', icon: 'flag-checkered', accentKey: 'summit' },
] as const;

export type CaminoWorld = (typeof CAMINO_WORLDS)[number];

export function getCaminoWorld(worldNumber: number): CaminoWorld {
  return CAMINO_WORLDS[worldNumber - 1] ?? CAMINO_WORLDS[0];
}

export function worldAccent(colors: ThemeColors, worldNumber: number): string {
  return colors.world[getCaminoWorld(worldNumber).accentKey];
}

/** Convierte un color #RRGGBB en rgba() para tintes suaves. */
export function withAlpha(hex: string, alpha: number): string {
  const clean = hex.replace('#', '');
  const full = clean.length === 3
    ? clean.split('').map((char) => char + char).join('')
    : clean;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
