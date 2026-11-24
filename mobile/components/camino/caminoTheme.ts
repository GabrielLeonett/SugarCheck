/**
 * Tokens del Camino del Guerrero para la app móvil.
 *
 * El mapa usa un lienzo virtual de 1000 x 3200 unidades, igual que la web,
 * para que el sendero y los niveles queden siempre alineados.
 */

export type TipoEntorno = 'reino' | 'valle' | 'isla' | 'templo' | 'cumbre';

export interface MundoTheme {
  numero: number;
  /** Clave dentro de warriorPath.worlds.* */
  key: 'energy' | 'safety' | 'carbohydrates' | 'insulin' | 'explorer';
  environment: TipoEntorno;
  emoji: string;
  skyTop: string;
  skyBottom: string;
  skyDarkTop: string;
  skyDarkBottom: string;
  ground: string;
  groundDark: string;
  accent: string;
  accentSoft: string;
  band: { y: number; height: number };
  levelRange: [number, number];
}

export interface NivelPos {
  numero: number;
  x: number;
  y: number;
  mundo: number;
}

export const MAP_WIDTH = 1000;
export const MAP_HEIGHT = 3200;

export const MUNDOS: MundoTheme[] = [
  {
    numero: 1,
    key: 'energy',
    environment: 'reino',
    emoji: '🏰',
    skyTop: '#dbeafe',
    skyBottom: '#eef6ff',
    skyDarkTop: '#1b2a3a',
    skyDarkBottom: '#22364a',
    ground: '#8fd39a',
    groundDark: '#4f9d63',
    accent: '#3b82f6',
    accentSoft: '#93c5fd',
    band: { y: 70, height: 620 },
    levelRange: [1, 3],
  },
  {
    numero: 2,
    key: 'safety',
    environment: 'valle',
    emoji: '🌋',
    skyTop: '#ffe8d6',
    skyBottom: '#fff4ea',
    skyDarkTop: '#2b1a18',
    skyDarkBottom: '#3a2320',
    ground: '#c98b62',
    groundDark: '#8a5a3b',
    accent: '#f97316',
    accentSoft: '#fdba74',
    band: { y: 700, height: 620 },
    levelRange: [4, 6],
  },
  {
    numero: 3,
    key: 'carbohydrates',
    environment: 'isla',
    emoji: '🏝️',
    skyTop: '#cffafe',
    skyBottom: '#ecfeff',
    skyDarkTop: '#0f2b33',
    skyDarkBottom: '#123a44',
    ground: '#5ec9a8',
    groundDark: '#2f8f74',
    accent: '#14b8a6',
    accentSoft: '#5eead4',
    band: { y: 1340, height: 620 },
    levelRange: [7, 9],
  },
  {
    numero: 4,
    key: 'insulin',
    environment: 'templo',
    emoji: '🏛️',
    skyTop: '#ede9fe',
    skyBottom: '#f7f3ff',
    skyDarkTop: '#241b3a',
    skyDarkBottom: '#2f2448',
    ground: '#c4b5fd',
    groundDark: '#7c6bb5',
    accent: '#8b5cf6',
    accentSoft: '#c4b5fd',
    band: { y: 1980, height: 620 },
    levelRange: [10, 12],
  },
  {
    numero: 5,
    key: 'explorer',
    environment: 'cumbre',
    emoji: '⛰️',
    skyTop: '#dbeafe',
    skyBottom: '#fff7ed',
    skyDarkTop: '#13233a',
    skyDarkBottom: '#1d3350',
    ground: '#cbd5e1',
    groundDark: '#94a3b8',
    accent: '#0ea5e9',
    accentSoft: '#7dd3fc',
    band: { y: 2620, height: 580 },
    levelRange: [13, 15],
  },
];

export const NIVELES: NivelPos[] = [
  { numero: 1, x: 300, y: 320, mundo: 1 },
  { numero: 2, x: 700, y: 470, mundo: 1 },
  { numero: 3, x: 300, y: 610, mundo: 1 },
  { numero: 4, x: 700, y: 950, mundo: 2 },
  { numero: 5, x: 300, y: 1100, mundo: 2 },
  { numero: 6, x: 700, y: 1240, mundo: 2 },
  { numero: 7, x: 300, y: 1590, mundo: 3 },
  { numero: 8, x: 700, y: 1740, mundo: 3 },
  { numero: 9, x: 300, y: 1880, mundo: 3 },
  { numero: 10, x: 700, y: 2230, mundo: 4 },
  { numero: 11, x: 300, y: 2380, mundo: 4 },
  { numero: 12, x: 700, y: 2520, mundo: 4 },
  { numero: 13, x: 300, y: 2870, mundo: 5 },
  { numero: 14, x: 700, y: 3010, mundo: 5 },
  { numero: 15, x: 300, y: 3120, mundo: 5 },
];

export type EstadoNivel = 'completado' | 'actual' | 'bloqueado';

export function estadoDeNivel(numero: number, ultimoCompletado: number): EstadoNivel {
  if (numero <= ultimoCompletado) return 'completado';
  if (numero === ultimoCompletado + 1) return 'actual';
  return 'bloqueado';
}

export function mundoDeNivel(numero: number): MundoTheme {
  const mundo = NIVELES.find((nivel) => nivel.numero === numero)?.mundo ?? 1;
  return MUNDOS.find((item) => item.numero === mundo) ?? MUNDOS[0];
}

/** Oscurece (o aclara, con factor negativo) un color hexadecimal. */
export function oscurecer(hex: string, factor = 0.28): string {
  const limpio = hex.replace('#', '');
  const completo =
    limpio.length === 3
      ? limpio
          .split('')
          .map((c) => c + c)
          .join('')
      : limpio;
  const num = parseInt(completo, 16);
  if (Number.isNaN(num)) return hex;
  const canal = (desplazamiento: number) => {
    const valor = (num >> desplazamiento) & 0xff;
    return Math.max(0, Math.min(255, Math.round(valor * (1 - factor))));
  };
  const r = canal(16);
  const g = canal(8);
  const b = canal(0);
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

/** Genera una curva suave en "S" que pasa por todos los puntos indicados. */
export function construirSendero(puntos: { x: number; y: number }[]): string {
  if (puntos.length === 0) return '';
  let path = `M ${puntos[0].x} ${puntos[0].y}`;
  for (let i = 1; i < puntos.length; i += 1) {
    const anterior = puntos[i - 1];
    const actual = puntos[i];
    const curva = (actual.y - anterior.y) * 0.55;
    path += ` C ${anterior.x} ${anterior.y + curva}, ${actual.x} ${actual.y - curva}, ${actual.x} ${actual.y}`;
  }
  return path;
}
