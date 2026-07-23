import { useState, useEffect, useCallback } from 'react';
import { imcApi, type ImcData } from '../apis/imc';
import useMetricData from './useMetricData';
import type { TimeRange } from './useMetricData';
import type { ImcRecord } from '../data/recordsMock';

export interface UseImcDataReturn {
  openModal: boolean;
  handleOpenModal: () => void;
  handleCloseModal: () => void;
  handleSave: (data: { peso: number; altura: number; fecha: string }) => Promise<void>;
  records: ImcRecord[];
  filtro: TimeRange;
  setFiltro: (range: TimeRange) => void;
  page: number;
  setPage: (page: number) => void;
  rowsPerPage: number;
  setRowsPerPage: (rows: number) => void;
  pesos: number[];
  fechas: string[];
  loading: boolean;
  error: string | null;
  ultimoImc: number | null;
  ultimaCategoria: string | null;
}

function toImcRecord(imc: ImcData): ImcRecord {
  const estado =
    imc.imcValue < 18.5 ? 'Bajo peso' :
    imc.imcValue < 25 ? 'Normal' :
    'Sobrepeso';

  return {
    id: parseInt(imc.id, 10) || Date.now(),
    fechaISO: imc.fecha,
    peso: imc.peso,
    estatura: imc.altura,
    imc: imc.imcValue,
    estado,
  };
}

export function useImcData(): UseImcDataReturn {
  const [openModal, setOpenModal] = useState(false);
  const [raw, setRaw] = useState<ImcRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const data = await imcApi.getAll();
      setRaw(data.map(toImcRecord));
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const metric = useMetricData<ImcRecord>(raw, 'todos');

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  const handleSave = async (data: { peso: number; altura: number; fecha: string }) => {
    const parts = data.fecha.split('-');
    const anio = parseInt(parts[0], 10);
    const mes = parseInt(parts[1], 10);
    const dia = parseInt(parts[2], 10);
    try {
      const created = await imcApi.create({
        peso: data.peso,
        altura: data.altura,
        dia,
        mes,
        anio,
      });
      setRaw((prev) => [...prev, toImcRecord(created)]);
      handleCloseModal();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al guardar';
      setError(message);
    }
  };

  const ultimo = raw.length > 0 ? raw[raw.length - 1] : null;

  return {
    openModal,
    handleOpenModal,
    handleCloseModal,
    handleSave,
    records: [...metric.filteredData].reverse(),
    filtro: metric.timeRange,
    setFiltro: metric.setTimeRange,
    page: metric.page,
    setPage: metric.setPage,
    rowsPerPage: metric.rowsPerPage,
    setRowsPerPage: metric.setRowsPerPage,
    pesos: metric.filteredData.map((r) => r.peso),
    fechas: metric.filteredData.map((r) => r.fechaISO),
    loading,
    error,
    ultimoImc: ultimo?.imc ?? null,
    ultimaCategoria: ultimo?.estado ?? null,
  };
}
