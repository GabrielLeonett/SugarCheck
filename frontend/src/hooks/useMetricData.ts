import { useState, useMemo, useCallback } from 'react';

export type TimeRange = 'hoy' | 'semana' | 'mes' | 'trimestre' | 'año' | 'todos' | 'personalizado';

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
    const y = ahora.getFullYear();
    const m = String(ahora.getMonth() + 1).padStart(2, '0');
    const d = String(ahora.getDate()).padStart(2, '0');
    const hoy = `${y}-${m}-${d}`;

    function dateStr(date: Date): string {
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }

    return initialData.filter((item) => {
      const itemDate = item.fechaISO.split('T')[0];
      switch (timeRange) {
        case 'hoy':
          return itemDate === hoy;
        case 'semana': {
          const inicio = new Date(ahora);
          inicio.setDate(ahora.getDate() - 7);
          return itemDate >= dateStr(inicio) && itemDate <= hoy;
        }
        case 'mes': {
          const inicio = new Date(ahora);
          inicio.setDate(ahora.getDate() - 30);
          return itemDate >= dateStr(inicio) && itemDate <= hoy;
        }
        case 'trimestre': {
          const inicio = new Date(ahora);
          inicio.setMonth(ahora.getMonth() - 3);
          return itemDate >= dateStr(inicio) && itemDate <= hoy;
        }
        case 'año': {
          const inicio = new Date(ahora);
          inicio.setFullYear(ahora.getFullYear() - 1);
          return itemDate >= dateStr(inicio) && itemDate <= hoy;
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
