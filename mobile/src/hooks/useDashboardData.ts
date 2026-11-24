import { useCallback, useEffect, useState } from 'react';

import { glucoseApi, type GlucoseEntry } from '@/src/apis/glucose';
import { imcApi } from '@/src/apis/imc';
import { insulinaApi } from '@/src/apis/insulina';
import { usePreferenceConfig } from '@/src/stores/preferenceStore';
import { showErrorAlert } from '@/src/stores/systemAlertStore';
import type { InsulinRecord, PhysicalRecord } from '@/src/types';
import { getGlucoseRangeStatus, type GlucoseRangeStatus } from '@/src/utils/glucoseRange';

/** Ventana de seguridad tras una dosis de insulina rápida. */
export const SAFETY_WINDOW_SECONDS = 3 * 60 * 60;

const RANGE_DAYS = 30;
const CHART_POINTS = 7;
const TIMER_TICK_MS = 30_000;

export type ImcCategory = 'Bajo peso' | 'Normal' | 'Sobrepeso';

export type SafetyStatus = 'none' | 'waiting' | 'soon' | 'safe';

export interface DashboardReading {
  label: string;
  value: number;
  rangeStatus: GlucoseRangeStatus;
}

export interface DashboardLastReading {
  nivel: number;
  contexto: string | null;
  timeLabel: string;
  rangeStatus: GlucoseRangeStatus;
}

export interface DashboardSafety {
  status: SafetyStatus;
  /** Tiempo restante del escudo en formato `h:mm`. */
  remainingLabel: string;
  /** Hace cuánto se aplicó la última dosis rápida. */
  lastDoseLabel: string | null;
}

/** Reparto porcentual de las lecturas del periodo. */
export interface DashboardDistribution {
  low: number;
  inRange: number;
  high: number;
}

/** Lectura reciente lista para pintarse como fila. */
export interface DashboardBattle {
  id: string;
  nivel: number;
  hora: string;
  contexto: string | null;
  rangeStatus: GlucoseRangeStatus;
}

/** Estadísticas del periodo mostrado. */
export interface DashboardSummary {
  average: number | null;
  min: number | null;
  max: number | null;
}

export interface DashboardData {
  loading: boolean;
  ultimaLectura: DashboardLastReading | null;
  /** Nivel de la lectura inmediatamente anterior (null si no existe). */
  lecturaAnterior: number | null;
  /** Diferencia en mg/dL con la lectura anterior. */
  deltaLectura: number | null;
  /** Porcentaje de lecturas dentro de rango (null si no hay lecturas). */
  porcentajeZonaSegura: number | null;
  totalLecturas: number;
  /** Reparto de lecturas entre baja, rango y alta. */
  distribucion: DashboardDistribution | null;
  /** Días consecutivos con al menos una lectura en rango. */
  rachaDias: number;
  /** Diferencia en puntos vs. los 30 días anteriores (null si no hay datos). */
  deltaZonaSegura: number | null;
  peso: number | null;
  estatura: number | null;
  imcAnterior: number | null;
  /** "Hace 3 días" de la última medición física. */
  imcFechaLabel: string | null;
  resumen: DashboardSummary;
  /** Las 3 lecturas más recientes. */
  batallasRecientes: DashboardBattle[];
  chartData: DashboardReading[];
  ultimoImc: number | null;
  imcCategoria: ImcCategory | null;
  safety: DashboardSafety;
  refresh: () => Promise<void>;
}

function formatRelativeTime(timestamp: number, reference: number): string {
  const diffMinutes = Math.floor((reference - timestamp) / 60000);
  if (diffMinutes < 1) return 'Ahora mismo';
  if (diffMinutes < 60) return `Hace ${diffMinutes} min`;
  const hours = Math.floor(diffMinutes / 60);
  if (hours < 24) return `Hace ${hours} ${hours === 1 ? 'hora' : 'horas'}`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Ayer';
  if (days < 7) return `Hace ${days} días`;
  return `Hace ${Math.floor(days / 7)} semanas`;
}

/** Diferencia en días de calendario entre dos timestamps. */
function calendarDaysAgo(timestamp: number, reference: number): number {
  const startOfDay = (value: number) => {
    const date = new Date(value);
    return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  };
  return Math.round((startOfDay(reference) - startOfDay(timestamp)) / (24 * 60 * 60 * 1000));
}

/** `Hoy`, `Ayer`, `Hace 3 días`… para fechas sin hora. */
function formatDaysAgo(timestamp: number, reference: number): string {
  const days = calendarDaysAgo(timestamp, reference);
  if (days <= 0) return 'Hoy';
  if (days === 1) return 'Ayer';
  if (days < 7) return `Hace ${days} días`;
  return `Hace ${Math.floor(days / 7)} semanas`;
}

function formatTimer(totalSeconds: number): string {
  const safe = Math.max(0, totalSeconds);
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  return `${hours}:${String(minutes).padStart(2, '0')}`;
}

/** `2:15 PM` → `2:15p` para que quepa en las columnas del gráfico. */
function compactTimeLabel(hora: string): string {
  return hora.replace(/\s?AM$/i, 'a').replace(/\s?PM$/i, 'p');
}

/** Convierte `dd/mm/yyyy` (formato del backend) a timestamp. */
function parseFecha(fecha: string): number {
  const [day, month, year] = fecha.split('/').map(Number);
  if (!day || !month || !year) return 0;
  return new Date(year, month - 1, day).getTime();
}

/** Clave `yyyy-mm-dd` en hora local. */
function dayKey(timestamp: number): string {
  const date = new Date(timestamp);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

/** Días consecutivos (hasta hoy) con al menos una lectura en rango. */
function countInRangeStreak(
  readings: GlucoseEntry[],
  reference: number,
  thresholds: { hypo: number; hiper: number }
): number {
  const inRangeDays = new Set<string>();
  for (const entry of readings) {
    if (getGlucoseRangeStatus(entry.nivel, thresholds) === 'inRange') {
      inRangeDays.add(dayKey(entry.timestamp.getTime()));
    }
  }

  if (inRangeDays.size === 0) return 0;

  const DAY_MS = 24 * 60 * 60 * 1000;
  let cursor = reference;
  // Si todavía no hay lectura hoy, la racha puede venir de ayer.
  if (!inRangeDays.has(dayKey(cursor))) {
    cursor -= DAY_MS;
    if (!inRangeDays.has(dayKey(cursor))) return 0;
  }

  let streak = 0;
  while (inRangeDays.has(dayKey(cursor))) {
    streak += 1;
    cursor -= DAY_MS;
  }
  return streak;
}

export function getImcCategory(imc: number): ImcCategory {
  if (imc < 18.5) return 'Bajo peso';
  if (imc >= 25) return 'Sobrepeso';
  return 'Normal';
}

export function useDashboardData(): DashboardData {
  const preference = usePreferenceConfig((state) => state.preference);
  const loadPreference = usePreferenceConfig((state) => state.load);

  const [glucose, setGlucose] = useState<GlucoseEntry[]>([]);
  const [physical, setPhysical] = useState<PhysicalRecord[]>([]);
  const [insulin, setInsulin] = useState<InsulinRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), TIMER_TICK_MS);
    return () => clearInterval(interval);
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      if (!usePreferenceConfig.getState().preference) {
        await loadPreference().catch(() => {
          // Sin sesión o sin red: se usan los umbrales por defecto.
        });
      }

      const results = await Promise.allSettled([
        glucoseApi.getAll(),
        imcApi.getAll(),
        insulinaApi.getAll({ tipo: 'RAPIDA' }),
      ]);

      const failures: string[] = [];

      if (results[0].status === 'fulfilled') {
        setGlucose(results[0].value);
      } else {
        failures.push('glucosa');
      }

      if (results[1].status === 'fulfilled') {
        setPhysical(results[1].value);
      } else {
        failures.push('mediciones físicas');
      }

      if (results[2].status === 'fulfilled') {
        setInsulin(results[2].value);
      } else {
        failures.push('insulina');
      }

      if (failures.length > 0) {
        showErrorAlert(`No se pudieron actualizar los datos de ${failures.join(', ')}`);
      }
    } finally {
      setLoading(false);
      setNow(Date.now());
    }
  }, [loadPreference]);

  const currentPreference = preference ?? usePreferenceConfig.getState().preference;
  const hypo = currentPreference?.thresholds?.hypo ?? 70;
  const hiper = currentPreference?.thresholds?.hiper ?? 180;

  const sortedGlucose = [...glucose]
    .filter(
      (entry) =>
        Number.isFinite(entry.nivel) &&
        Number.isFinite(entry.timestamp.getTime())
    )
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  const lastReading = sortedGlucose[0] ?? null;

  const cutoff = now - RANGE_DAYS * 24 * 60 * 60 * 1000;
  const recentReadings = sortedGlucose.filter((entry) => entry.timestamp.getTime() >= cutoff);
  const rangeReadings = recentReadings.length > 0 ? recentReadings : sortedGlucose;
  const totalLecturas = rangeReadings.length;

  let lowCount = 0;
  let inRangeCount = 0;
  let highCount = 0;
  let sum = 0;
  let min = Infinity;
  let max = -Infinity;

  for (const entry of rangeReadings) {
    const status = getGlucoseRangeStatus(entry.nivel, { hypo, hiper });
    if (status === 'low') lowCount += 1;
    else if (status === 'high') highCount += 1;
    else inRangeCount += 1;

    sum += entry.nivel;
    if (entry.nivel < min) min = entry.nivel;
    if (entry.nivel > max) max = entry.nivel;
  }

  const ultimaLectura: DashboardLastReading | null = lastReading
    ? {
        nivel: lastReading.nivel,
        contexto: lastReading.contexto || null,
        timeLabel: formatRelativeTime(lastReading.timestamp.getTime(), now),
        rangeStatus: getGlucoseRangeStatus(lastReading.nivel, { hypo, hiper }),
      }
    : null;

  const lecturaAnterior = sortedGlucose[1]?.nivel ?? null;
  const deltaLectura =
    lastReading && lecturaAnterior !== null ? lastReading.nivel - lecturaAnterior : null;

  const porcentajeZonaSegura =
    totalLecturas > 0 ? Math.round((inRangeCount / totalLecturas) * 100) : null;

  const distribucion: DashboardDistribution | null =
    totalLecturas > 0
      ? {
          low: Math.round((lowCount / totalLecturas) * 100),
          inRange: Math.round((inRangeCount / totalLecturas) * 100),
          high: Math.round((highCount / totalLecturas) * 100),
        }
      : null;

  const resumen: DashboardSummary =
    totalLecturas > 0
      ? {
          average: Math.round(sum / totalLecturas),
          min,
          max,
        }
      : { average: null, min: null, max: null };

  const rachaDias = countInRangeStreak(rangeReadings, now, { hypo, hiper });

  const previousCutoff = cutoff - RANGE_DAYS * 24 * 60 * 60 * 1000;
  const previousReadings = sortedGlucose.filter((entry) => {
    const timestamp = entry.timestamp.getTime();
    return timestamp >= previousCutoff && timestamp < cutoff;
  });
  const previousInRange = previousReadings.filter(
    (entry) => getGlucoseRangeStatus(entry.nivel, { hypo, hiper }) === 'inRange'
  ).length;
  const deltaZonaSegura =
    porcentajeZonaSegura !== null && previousReadings.length > 0
      ? porcentajeZonaSegura - Math.round((previousInRange / previousReadings.length) * 100)
      : null;

  const batallasRecientes: DashboardBattle[] = sortedGlucose
    .slice(0, 3)
    .map((entry) => ({
      id: entry.id,
      nivel: entry.nivel,
      hora: entry.hora,
      contexto: entry.contexto || null,
      rangeStatus: getGlucoseRangeStatus(entry.nivel, { hypo, hiper }),
    }));

  const chartData: DashboardReading[] = sortedGlucose
    .slice(0, CHART_POINTS)
    .reverse()
    .map((entry) => ({
      label: compactTimeLabel(entry.hora),
      value: entry.nivel,
      rangeStatus: getGlucoseRangeStatus(entry.nivel, { hypo, hiper }),
    }));

  const sortedPhysical = [...physical].sort(
    (a, b) => parseFecha(b.fecha) - parseFecha(a.fecha)
  );
  const latestPhysical = sortedPhysical[0] ?? null;
  const previousPhysical = sortedPhysical[1] ?? null;
  const ultimoImc = latestPhysical?.imc ?? null;
  const imcCategoria = ultimoImc !== null ? getImcCategory(ultimoImc) : null;
  const peso = latestPhysical?.peso ?? null;
  const estatura = latestPhysical?.estatura ?? null;
  const imcAnterior = previousPhysical?.imc ?? null;
  const imcFechaLabel =
    latestPhysical !== null
      ? formatDaysAgo(parseFecha(latestPhysical.fecha), now)
      : null;

  const lastInsulinAt = insulin.reduce<number | null>((latest, record) => {
    const timestamp = new Date(record.createdAt).getTime();
    if (Number.isNaN(timestamp)) return latest;
    return latest === null || timestamp > latest ? timestamp : latest;
  }, null);

  let safety: DashboardSafety;
  if (lastInsulinAt === null) {
    safety = { status: 'none', remainingLabel: '--', lastDoseLabel: null };
  } else {
    const elapsedSeconds = Math.floor((now - lastInsulinAt) / 1000);
    const remainingSeconds = Math.max(
      0,
      Math.min(SAFETY_WINDOW_SECONDS, SAFETY_WINDOW_SECONDS - elapsedSeconds)
    );
    safety = {
      status:
        remainingSeconds <= 0 ? 'safe' : remainingSeconds < 1800 ? 'soon' : 'waiting',
      remainingLabel: formatTimer(remainingSeconds),
      lastDoseLabel: formatRelativeTime(lastInsulinAt, now),
    };
  }

  return {
    loading,
    ultimaLectura,
    lecturaAnterior,
    deltaLectura,
    porcentajeZonaSegura,
    totalLecturas,
    distribucion,
    rachaDias,
    deltaZonaSegura,
    peso,
    estatura,
    imcAnterior,
    imcFechaLabel,
    resumen,
    batallasRecientes,
    chartData,
    ultimoImc,
    imcCategoria,
    safety,
    refresh,
  };
}
