import { useState, useEffect, useCallback, useMemo } from 'react';
import { insulinaApi, type InsulinRecord, type InsulinQueryParams } from '../apis/insulina';
import type { TimeRange } from './useMetricData';

export interface UseInsulinaDataReturn {
  registros: InsulinRecord[];
  loading: boolean;
  error: string | null;
  timeRange: TimeRange;
  setTimeRange: (range: TimeRange) => void;
  customRange: { start: string; end: string } | null;
  setCustomRange: (range: { start: string; end: string } | null) => void;
  tipoFilter: 'todas' | 'lenta' | 'rapida';
  setTipoFilter: (filter: 'todas' | 'lenta' | 'rapida') => void;
  page: number;
  setPage: (page: number) => void;
  rowsPerPage: number;
  setRowsPerPage: (rows: number) => void;
  horasInsulina: string[];
  dosisInsulina: number[];
  refresh: () => void;
}

const PRESET_RANGES: Record<Exclude<TimeRange, 'personalizado' | 'todos'>, { days: number }> = {
  hoy: { days: 0 },
  semana: { days: 7 },
  mes: { days: 30 },
  trimestre: { days: 90 },
  año: { days: 365 },
};

function dateToStr(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function getPresetRange(preset: Exclude<TimeRange, 'personalizado' | 'todos'>): { start: string; end: string } {
  const now = new Date();
  const end = dateToStr(now);
  const startDate = new Date(now);
  startDate.setDate(now.getDate() - PRESET_RANGES[preset].days);
  const start = dateToStr(startDate);
  return { start, end };
}

export function useInsulinaData(externalRefreshTrigger?: number): UseInsulinaDataReturn {
  const [rawRegistros, setRawRegistros] = useState<InsulinRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>('mes');
  const [customRange, setCustomRange] = useState<{ start: string; end: string } | null>(null);
  const [tipoFilter, setTipoFilter] = useState<'todas' | 'lenta' | 'rapida'>('todas');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(4);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadRegistros = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let params: InsulinQueryParams = {};

      if (tipoFilter !== 'todas') {
        params.tipo = tipoFilter === 'lenta' ? 'LENTA' : 'RAPIDA';
      }

      if (timeRange === 'personalizado' && customRange) {
        params.startDate = customRange.start;
        params.endDate = customRange.end;
      } else if (timeRange !== 'todos') {
        const range = getPresetRange(timeRange as Exclude<TimeRange, 'personalizado' | 'todos'>);
        params.startDate = range.start;
        params.endDate = range.end;
      }

      const data = await insulinaApi.getAll(params);
      setRawRegistros(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al cargar registros de insulina';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [timeRange, customRange, tipoFilter, refreshKey, externalRefreshTrigger]);

  useEffect(() => {
    loadRegistros();
  }, [loadRegistros, externalRefreshTrigger]);

  const filteredData = useMemo(() => {
    return [...rawRegistros].reverse();
  }, [rawRegistros]);

  const horasInsulina = filteredData.map(item => item.hora.replace(/\s+/g, ''));
  const dosisInsulina = filteredData.map(item => item.dosis);

  const refresh = useCallback(() => {
    setRefreshKey(k => k + 1);
  }, []);

  return {
    registros: filteredData,
    loading,
    error,
    timeRange,
    setTimeRange: (range: TimeRange) => {
      setTimeRange(range);
      setPage(0);
    },
    customRange,
    setCustomRange: (range: { start: string; end: string } | null) => {
      setCustomRange(range);
      setPage(0);
    },
    tipoFilter,
    setTipoFilter: (filter: 'todas' | 'lenta' | 'rapida') => {
      setTipoFilter(filter);
      setPage(0);
    },
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    horasInsulina,
    dosisInsulina,
    refresh,
  };
}