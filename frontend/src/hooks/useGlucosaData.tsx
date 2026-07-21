import { useState } from 'react';
import { historialGlucosaMock, historialHbA1cMock } from '../data/recordsMock';
import useMetricData from './useMetricData';
import type { GlucosaRecord, HbA1cRecord } from '../data/recordsMock';

export const obtenerColorEstado = (estado: string) => {
  switch (estado) {
    case 'Alto': case 'Elevado': return 'warning.light';
    case 'Bajo': return 'info.light';
    case 'Normal': case 'En Meta': return 'success.light';
    default: return 'text.primary';
  }
};

export function useGlucosaData() {
  const [openGlucosa, setOpenGlucosa] = useState(false);
  const [openHbA1c, setOpenHbA1c] = useState(false);

  const glucosa = useMetricData<GlucosaRecord>(historialGlucosaMock, 'mes');
  const hbA1c = useMetricData<HbA1cRecord>(historialHbA1cMock, 'todos');

  const handleOpenGlucosa = () => setOpenGlucosa(true);
  const handleCloseGlucosa = () => setOpenGlucosa(false);
  const handleOpenHbA1c = () => setOpenHbA1c(true);
  const handleCloseHbA1c = () => setOpenHbA1c(false);

  const horasGlucosa = glucosa.filteredData.map((item) => item.hora.replace(/\s+/g, ''));
  const nivelesGlucosa = glucosa.filteredData.map((item) => item.nivel);
  const fechasHbA1c = hbA1c.filteredData.map((item) => item.fecha);
  const resultadosHbA1c = hbA1c.filteredData.map((item) => item.resultado);

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
    glucosaFiltrada: [...glucosa.filteredData].reverse(),
    hbA1cFiltrada: [...hbA1c.filteredData].reverse(),
    horasGlucosa, nivelesGlucosa,
    fechasHbA1c, resultadosHbA1c,
  };
}
