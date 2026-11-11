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

export interface DashboardData {
  loading: boolean;
  ultimaLectura: DashboardLastReading | null;
  /** Porcentaje de lecturas dentro de rango (null si no hay lecturas). */
  porcentajeZonaSegura: number | null;
  totalLecturas: number;
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

  const sortedGlucose = [...glucose].sort(
    (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
  );
  const lastReading = sortedGlucose[0] ?? null;

  const cutoff = now - RANGE_DAYS * 24 * 60 * 60 * 1000;
  const recentReadings = sortedGlucose.filter((entry) => entry.timestamp.getTime() >= cutoff);
  const rangeReadings = recentReadings.length > 0 ? recentReadings : sortedGlucose;
  const totalLecturas = rangeReadings.length;
  const inRangeCount = rangeReadings.filter(
    (entry) => getGlucoseRangeStatus(entry.nivel, { hypo, hiper }) === 'inRange'
  ).length;

  const ultimaLectura: DashboardLastReading | null = lastReading
    ? {
        nivel: lastReading.nivel,
        contexto: lastReading.contexto || null,
        timeLabel: formatRelativeTime(lastReading.timestamp.getTime(), now),
        rangeStatus: getGlucoseRangeStatus(lastReading.nivel, { hypo, hiper }),
      }
    : null;

  const porcentajeZonaSegura =
    totalLecturas > 0 ? Math.round((inRangeCount / totalLecturas) * 100) : null;

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
  const ultimoImc = sortedPhysical[0]?.imc ?? null;
  const imcCategoria = ultimoImc !== null ? getImcCategory(ultimoImc) : null;

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
    porcentajeZonaSegura,
    totalLecturas,
    chartData,
    ultimoImc,
    imcCategoria,
    safety,
    refresh,
  };
}
