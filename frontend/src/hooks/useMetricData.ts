import { useState, useMemo, useCallback } from 'react';

export type TimeRange = 'hoy' | 'semana' | 'mes' | 'trimestre' | 'año' | 'todos';

interface UseMetricDataOptions {
  initialRowsPerPage?: number;
}

interface UseMetricDataReturn<T> {
  timeRange: TimeRange;
  setTimeRange: (range: TimeRange) => void;
  filteredData: T[];
  page: number;
  rowsPerPage: number;
  setPage: (page: number) => void;
  setRowsPerPage: (rowsPerPage: number) => void;
  handleChangePage: (event: unknown, newPage: number) => void;
  handleChangeRowsPerPage: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

function useMetricData<T extends { id: string | number; fechaISO: string }>(
  initialData: T[],
  initialTimeRange: TimeRange = 'mes',
  options?: UseMetricDataOptions
): UseMetricDataReturn<T> {
  const [timeRange, setTimeRange] = useState<TimeRange>(initialTimeRange);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(options?.initialRowsPerPage ?? 4);

  const filteredData = useMemo(() => {
    const ahora = new Date();
    return initialData.filter((item) => {
      const fechaItem = new Date(item.fechaISO);
      switch (timeRange) {
        case 'hoy':
          return fechaItem.toDateString() === ahora.toDateString();
        case 'semana': {
          const sieteDiasAtras = new Date();
          sieteDiasAtras.setDate(ahora.getDate() - 7);
          return fechaItem >= sieteDiasAtras;
        }
        case 'mes': {
          const treintaDiasAtras = new Date();
          treintaDiasAtras.setDate(ahora.getDate() - 30);
          return fechaItem >= treintaDiasAtras;
        }
        case 'trimestre': {
          const tresMesesAtras = new Date();
          tresMesesAtras.setMonth(ahora.getMonth() - 3);
          return fechaItem >= tresMesesAtras;
        }
        case 'año': {
          const unAnoAtras = new Date();
          unAnoAtras.setFullYear(ahora.getFullYear() - 1);
          return fechaItem >= unAnoAtras;
        }
        case 'todos':
          return true;
        default:
          return true;
      }
    });
  }, [initialData, timeRange]);

  const handleChangePage = useCallback((_: unknown, newPage: number) => {
    setPage(newPage);
  }, []);

  const handleChangeRowsPerPage = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setRowsPerPage(parseInt(event.target.value, 10));
      setPage(0);
    },
    []
  );

  return {
    timeRange,
    setTimeRange,
    filteredData,
    page,
    rowsPerPage,
    setPage,
    setRowsPerPage,
    handleChangePage,
    handleChangeRowsPerPage,
  };
}

export default useMetricData;
