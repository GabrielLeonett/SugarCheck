import { useState, useEffect, useCallback } from 'react';
import { glucoseApi } from '../apis/glucose';
import type { CreateGlucosePayload } from '../apis/glucose';
import { hba1cApi } from '../apis/hba1c';
import type { CreateHbA1cPayload } from '../apis/hba1c';
import { preferenceStore } from './usePreferenceConfig';
import { useNotificationStore } from '../stores/notificationStore';
import useMetricData from './useMetricData';
import type { TimeRange } from './useMetricData';
import type { GlucosaRecord, HbA1cRecord } from '../data/recordsMock';

export const obtenerColorEstado = (estado: string) => {
  switch (estado) {
    case 'Alto': case 'Elevado': return 'warning.light';
    case 'Bajo': return 'info.light';
    case 'Normal': case 'En Meta': return 'success.light';
    default: return 'text.primary';
  }
};

export interface UseGlucosaDataReturn {
  openGlucosa: boolean;
  openHbA1c: boolean;
  filtroGlucosa: TimeRange;
  setFiltroGlucosa: (range: TimeRange) => void;
  filtroHbA1c: TimeRange;
  setFiltroHbA1c: (range: TimeRange) => void;
  pageGlucosa: number;
  setPageGlucosa: (page: number) => void;
  rowsPerPageGlucosa: number;
  setRowsPerPageGlucosa: (rows: number) => void;
  pageHbA1c: number;
  setPageHbA1c: (page: number) => void;
  rowsPerPageHbA1c: number;
  setRowsPerPageHbA1c: (rows: number) => void;
  handleOpenGlucosa: () => void;
  handleCloseGlucosa: () => void;
  handleOpenHbA1c: () => void;
  handleCloseHbA1c: () => void;
  handleSaveGlucosa: (data: CreateGlucosePayload) => Promise<void>;
  handleSaveHbA1c: (data: CreateHbA1cPayload) => Promise<void>;
  glucosaFiltrada: GlucosaRecord[];
  hbA1cFiltrada: HbA1cRecord[];
  horasGlucosa: string[];
  nivelesGlucosa: number[];
  fechasHbA1c: string[];
  resultadosHbA1c: number[];
  loading: boolean;
  error: string | null;
  isCrisis: boolean;
  crisisValue: number | null;
  handleCloseCrisis: () => void;
  hasGlucosaData: boolean;
  porcentajeZonaSegura: number;
  porcentajeHiper: number;
  porcentajeHipo: number;
  porcentajeEnRango: number;
  cantHiperglucemias: number;
  cantHipoglucemias: number;
  cantEnRango: number;
  ultimoResultadoHbA1c: number | undefined;
  ultimoEag: number | undefined;
  enRangoObjetivo: boolean | undefined;
}

export function useGlucosaData(): UseGlucosaDataReturn {
  const [openGlucosa, setOpenGlucosa] = useState(false);
  const [openHbA1c, setOpenHbA1c] = useState(false);
  const [glucosaRaw, setGlucosaRaw] = useState<GlucosaRecord[]>([]);
  const [hbA1cRaw, setHbA1cRaw] = useState<HbA1cRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCrisis, setIsCrisis] = useState(false);
  const [crisisValue, setCrisisValue] = useState<number | null>(null);

  const addNotification = useNotificationStore((s) => s.addNotification);

  const thresholds = preferenceStore((s) => s.preference?.thresholds);

  const loadData = useCallback(async () => {
    try {
      const [glucosa, hba1c] = await Promise.all([
        glucoseApi.getAll(thresholds),
        hba1cApi.getAll(),
      ]);
      setGlucosaRaw(glucosa);
      setHbA1cRaw(hba1c);
      setError(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al cargar datos';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [thresholds]);

  useEffect(() => {
    loadData(); // eslint-disable-line react-hooks/set-state-in-effect
  }, [loadData]);

  const glucosa = useMetricData<GlucosaRecord>(glucosaRaw, 'mes');
  const hbA1c = useMetricData<HbA1cRecord>(hbA1cRaw, 'todos');

  const handleOpenGlucosa = () => setOpenGlucosa(true);
  const handleCloseGlucosa = () => setOpenGlucosa(false);
  const handleOpenHbA1c = () => setOpenHbA1c(true);
  const handleCloseHbA1c = () => setOpenHbA1c(false);

  const handleSaveGlucosa = async (data: Parameters<typeof glucoseApi.create>[0]) => {
    try {
      const { record, alert } = await glucoseApi.create(data, thresholds);
      setGlucosaRaw((prev) => [...prev, record]);
      addNotification({
        id: `glucose-${Date.now()}`,
        type: 'info',
        title: 'Glucosa',
        message: 'Registro de glucosa guardado exitosamente',
        read: false,
        createdAt: new Date().toISOString(),
        link: '/bitacora/control-glucosa',
      });
      if (alert) {
        setIsCrisis(true);
        setCrisisValue(record.nivel);
      }
      handleCloseGlucosa();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al guardar glucosa';
      addNotification({
        id: `glucose-err-${Date.now()}`,
        type: 'warning',
        title: 'Error',
        message,
        read: false,
        createdAt: new Date().toISOString(),
        link: '/bitacora/control-glucosa',
      });
    }
  };

  const handleSaveHbA1c = async (data: Parameters<typeof hba1cApi.create>[0]) => {
    try {
      const record = await hba1cApi.create(data);
      setHbA1cRaw((prev) => [...prev, record]);
      addNotification({
        id: `hba1c-${Date.now()}`,
        type: 'info',
        title: 'HbA1c',
        message: 'Resultado de HbA1c guardado exitosamente',
        read: false,
        createdAt: new Date().toISOString(),
        link: '/bitacora/control-glucosa',
      });
      handleCloseHbA1c();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al guardar HbA1c';
      addNotification({
        id: `hba1c-err-${Date.now()}`,
        type: 'warning',
        title: 'Error',
        message,
        read: false,
        createdAt: new Date().toISOString(),
        link: '/bitacora/control-glucosa',
      });
    }
  };

  const handleCloseCrisis = () => {
    setIsCrisis(false);
    setCrisisValue(null);
  };

  const horasGlucosa = glucosa.filteredData.map((item) => item.hora.replace(/\s+/g, ''));
  const nivelesGlucosa = glucosa.filteredData.map((item) => item.nivel);
  const fechasHbA1c = hbA1c.filteredData.map((item) => item.fecha);
  const resultadosHbA1c = hbA1c.filteredData.map((item) => item.resultado);

  const totalFiltrados = glucosa.filteredData.length;
  const normales = glucosa.filteredData.filter((r) => r.estado === 'Normal').length;
  const altos = glucosa.filteredData.filter((r) => r.estado === 'Alto').length;
  const bajos = glucosa.filteredData.filter((r) => r.estado === 'Bajo').length;
  const hasGlucosaData = totalFiltrados >= 2;
  const porcentajeZonaSegura = totalFiltrados > 0 ? Math.round((normales / totalFiltrados) * 100) : 0;
  const porcentajeHiper = totalFiltrados > 0 ? Math.round((altos / totalFiltrados) * 100) : 0;
  const porcentajeHipo = totalFiltrados > 0 ? Math.round((bajos / totalFiltrados) * 100) : 0;
  const porcentajeEnRango = totalFiltrados > 0 ? Math.round((normales / totalFiltrados) * 100) : 0;

  const ultimoHbA1c = hbA1cRaw.length > 0 ? hbA1cRaw[hbA1cRaw.length - 1] : null;

  return {
    openGlucosa, openHbA1c,
    filtroGlucosa: glucosa.timeRange,
    setFiltroGlucosa: glucosa.setTimeRange,
    filtroHbA1c: hbA1c.timeRange,
    setFiltroHbA1c: hbA1c.setTimeRange,
    pageGlucosa: glucosa.page,
    setPageGlucosa: glucosa.setPage,
    rowsPerPageGlucosa: glucosa.rowsPerPage,
    setRowsPerPageGlucosa: glucosa.setRowsPerPage,
    pageHbA1c: hbA1c.page,
    setPageHbA1c: hbA1c.setPage,
    rowsPerPageHbA1c: hbA1c.rowsPerPage,
    setRowsPerPageHbA1c: hbA1c.setRowsPerPage,
    handleOpenGlucosa, handleCloseGlucosa,
    handleOpenHbA1c, handleCloseHbA1c,
    handleSaveGlucosa, handleSaveHbA1c,
    glucosaFiltrada: [...glucosa.filteredData].reverse(),
    hbA1cFiltrada: [...hbA1c.filteredData].reverse(),
    horasGlucosa, nivelesGlucosa,
    fechasHbA1c, resultadosHbA1c,
    loading, error,
    isCrisis, crisisValue, handleCloseCrisis,
    hasGlucosaData,
    porcentajeZonaSegura,
    porcentajeHiper, porcentajeHipo, porcentajeEnRango,
    cantHiperglucemias: altos,
    cantHipoglucemias: bajos,
    cantEnRango: normales,
    ultimoResultadoHbA1c: ultimoHbA1c?.resultado,
    ultimoEag: ultimoHbA1c ? Math.round(parseInt(ultimoHbA1c.estimado, 10)) : undefined,
    enRangoObjetivo: ultimoHbA1c ? ultimoHbA1c.estado === 'En Meta' : undefined,
  };
}
