import { useState, useEffect, useCallback } from 'react';
import { insulinaApi, type InsulinRecord } from '../apis/insulina';
import useMetricData from './useMetricData';
import type { CustomDateRange, TimeRange } from './useMetricData';

export type TipoInsulinaFilter = 'todas' | 'lenta' | 'rapida';

export interface UseInsulinaDataReturn {
  registros: InsulinRecord[];
  loading: boolean;
  error: string | null;
  timeRange: TimeRange;
  setTimeRange: (range: TimeRange) => void;
  customRange: CustomDateRange | null;
  setCustomRange: (range: CustomDateRange | null) => void;
  tipoFilter: TipoInsulinaFilter;
  setTipoFilter: (filter: TipoInsulinaFilter) => void;
  page: number;
  setPage: (page: number) => void;
  rowsPerPage: number;
  setRowsPerPage: (rows: number) => void;
  horasInsulina: string[];
  dosisInsulina: number[];
  refresh: () => void;
}

function formatFechaCorta(iso: string): string {
  const date = new Date(iso);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}`;
}

const getTipoToken = (item: InsulinRecord): string =>
  item.tipo === 'LENTA' ? 'lenta' : item.tipo === 'RAPIDA' ? 'rapida' : 'todas';

const getFecha = (item: InsulinRecord): string => item.fecha;

export function useInsulinaData(externalRefreshTrigger?: number): UseInsulinaDataReturn {
  const [rawRegistros, setRawRegistros] = useState<InsulinRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadRegistros = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await insulinaApi.getAll();
      const sorted = [...data].sort((a, b) => {
        const dateDiff = a.fecha.localeCompare(b.fecha);
        if (dateDiff !== 0) return dateDiff;
        return a.hora.localeCompare(b.hora);
      });
      setRawRegistros(sorted);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al cargar registros de insulina';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRegistros(); // eslint-disable-line react-hooks/set-state-in-effect
  }, [loadRegistros, refreshKey, externalRefreshTrigger]);

  const metric = useMetricData<InsulinRecord>(rawRegistros, 'mes', {
    dateAccessor: getFecha,
    getType: getTipoToken,
    initialTypeFilter: 'lenta',
  });

  const incluirFecha = metric.timeRange !== 'hoy';
  const horasInsulina = metric.filteredData.map((item) => {
    const hora = item.hora.replace(/\s+/g, '');
    return incluirFecha ? `${formatFechaCorta(item.fecha)} ${hora}` : hora;
  });
  const dosisInsulina = metric.filteredData.map((item) => item.dosis);

  const refresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  return {
    registros: metric.filteredData,
    loading,
    error,
    timeRange: metric.timeRange,
    setTimeRange: metric.setTimeRange,
    customRange: metric.customRange,
    setCustomRange: metric.setCustomRange,
    tipoFilter: metric.typeFilter as TipoInsulinaFilter,
    setTipoFilter: (filter: TipoInsulinaFilter) => metric.setTypeFilter(filter),
    page: metric.page,
    setPage: metric.setPage,
    rowsPerPage: metric.rowsPerPage,
    setRowsPerPage: metric.setRowsPerPage,
    horasInsulina,
    dosisInsulina,
    refresh,
  };
}
