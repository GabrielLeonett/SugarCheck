import { useState, useMemo, useCallback } from 'react';

export type TimeRange =
  | 'hoy'
  | 'semana'
  | 'mes'
  | 'trimestre'
  | 'año'
  | 'todos'
  | 'personalizado';

export interface CustomDateRange {
  /** Fecha de inicio en formato 'YYYY-MM-DD'. Vacío indica sin límite inferior. */
  start: string;
  /** Fecha de fin en formato 'YYYY-MM-DD'. Vacío indica sin límite superior. */
  end: string;
}

export interface PresetRange {
  start: string;
  end: string;
}

const TYPE_ALL = 'todos';

export interface UseMetricDataOptions<T> {
  initialRowsPerPage?: number;
  initialCustomRange?: CustomDateRange | null;
  initialYearFilter?: number | null;
  initialTypeFilter?: string;
  /** Devuelve el "token" de tipo del item (ej. 'lenta' | 'rapida'). */
  getType?: (item: T) => string;
  /** Acceso al campo de fecha del item (por defecto `item.fechaISO`). */
  dateAccessor?: (item: T) => string;
}

export interface UseMetricDataReturn<T> {
  timeRange: TimeRange;
  setTimeRange: (range: TimeRange) => void;
  customRange: CustomDateRange | null;
  setCustomRange: (range: CustomDateRange | null) => void;
  yearFilter: number | null;
  setYearFilter: (year: number | null) => void;
  typeFilter: string;
  setTypeFilter: (type: string) => void;
  filteredData: T[];
  page: number;
  rowsPerPage: number;
  setPage: (page: number) => void;
  setRowsPerPage: (rowsPerPage: number) => void;
  handleChangePage: (event: unknown, newPage: number) => void;
  handleChangeRowsPerPage: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

function dateToKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/**
 * Normaliza un valor ISO a su clave de día 'YYYY-MM-DD' comparando únicamente
 * los primeros 10 caracteres, evitando así desfases por zona horaria.
 */
export function toDateKey(iso: string): string {
  return iso.slice(0, 10);
}

/**
 * Calcula el rango [start, end] (claves de día) de un preset estático a partir
 * de la fecha actual del sistema. `end` siempre es el día completo de hoy.
 */
export function computePresetRange(
  range: Exclude<TimeRange, 'personalizado' | 'todos'>
): PresetRange {
  const now = new Date();
  const end = dateToKey(now);

  if (range === 'hoy') {
    return { start: end, end };
  }

  const start = new Date(now);

  switch (range) {
    case 'semana':
      start.setDate(now.getDate() - 7);
      break;
    case 'mes':
      start.setDate(now.getDate() - 30);
      break;
    case 'trimestre':
      start.setMonth(now.getMonth() - 3);
      break;
    case 'año':
      start.setFullYear(now.getFullYear() - 1);
      break;
  }

  return { start: dateToKey(start), end };
}

const defaultDateAccessor = <T,>(item: T): string =>
  (item as unknown as { fechaISO: string }).fechaISO;

function useMetricData<T extends { id: string | number }>(
  initialData: T[],
  initialTimeRange: TimeRange = 'mes',
  options?: UseMetricDataOptions<T>
): UseMetricDataReturn<T> {
  const {
    initialRowsPerPage = 4,
    initialCustomRange = null,
    initialYearFilter = null,
    initialTypeFilter = TYPE_ALL,
    getType,
    dateAccessor = defaultDateAccessor,
  } = options ?? {};

  const [timeRange, setTimeRange] = useState<TimeRange>(initialTimeRange);
  const [customRange, setCustomRange] = useState<CustomDateRange | null>(
    initialCustomRange
  );
  const [yearFilter, setYearFilter] = useState<number | null>(initialYearFilter);
  const [typeFilter, setTypeFilter] = useState<string>(initialTypeFilter);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);

  const filteredData = useMemo(() => {
    return initialData.filter((item) => {
      const dateKey = toDateKey(dateAccessor(item));

      // (filtroTiempo === 'todos' || enRango)
      const enRango =
        timeRange === 'todos'
          ? true
          : timeRange === 'personalizado'
            ? customRange
              ? (!customRange.start || dateKey >= toDateKey(customRange.start)) &&
                (!customRange.end || dateKey <= toDateKey(customRange.end))
              : true
            : (() => {
                const range = computePresetRange(timeRange);
                return dateKey >= range.start && dateKey <= range.end;
              })();

      // (filtroTipo === 'todos' || coincideTipo)
      const coincideTipo =
        typeFilter === TYPE_ALL ||
        (getType ? getType(item) === typeFilter : true);

      // (!yearFilter || coincideAño)
      const coincideAño =
        yearFilter === null
          ? true
          : parseInt(dateKey.slice(0, 4), 10) === yearFilter;

      return enRango && coincideTipo && coincideAño;
    });
  }, [initialData, timeRange, customRange, yearFilter, typeFilter, getType, dateAccessor]);

  const handleTimeRange = useCallback((range: TimeRange) => {
    setTimeRange(range);
    setPage(0);
  }, []);

  const handleCustomRange = useCallback((range: CustomDateRange | null) => {
    setCustomRange(range);
    setPage(0);
  }, []);

  const handleYearFilter = useCallback((year: number | null) => {
    setYearFilter(year);
    setPage(0);
  }, []);

  const handleTypeFilter = useCallback((type: string) => {
    setTypeFilter(type);
    setPage(0);
  }, []);

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
    setTimeRange: handleTimeRange,
    customRange,
    setCustomRange: handleCustomRange,
    yearFilter,
    setYearFilter: handleYearFilter,
    typeFilter,
    setTypeFilter: handleTypeFilter,
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
