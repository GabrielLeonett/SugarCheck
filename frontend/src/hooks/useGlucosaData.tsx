import * as React from 'react';
import { historialGlucosaMock, historialHbA1cMock } from '../data/recordsMock';

export const obtenerColorEstado = (estado: string) => {
  switch (estado) {
    case 'Alto': case 'Elevado': return 'warning.light';
    case 'Bajo': return 'info.light';
    case 'Normal': case 'En Meta': return 'success.light';
    default: return 'text.primary';
  }
};

export function useGlucosaData() {
  const [openGlucosa, setOpenGlucosa] = React.useState(false);
  const [openHbA1c, setOpenHbA1c] = React.useState(false);

  const [filtroGlucosa, setFiltroGlucosa] = React.useState<'hoy' | 'semana' | 'mes'>('mes');
  const [filtroHbA1c, setFiltroHbA1c] = React.useState<'trimestre' | 'año' | 'todos'>('todos');

  const [pageGlucosa, setPageGlucosa] = React.useState(0);
  const [rowsPerPageGlucosa, setRowsPerPageGlucosa] = React.useState(4);
  const [pageHbA1c, setPageHbA1c] = React.useState(0);
  const [rowsPerPageHbA1c, setRowsPerPageHbA1c] = React.useState(4);

  const handleOpenGlucosa = () => {
    setOpenGlucosa(true);
  };

  const handleCloseGlucosa = () => {
    setOpenGlucosa(false);
  };

  const handleOpenHbA1c = () => {
    setOpenHbA1c(true);
  };

  const handleCloseHbA1c = () => {
    setOpenHbA1c(false);
  };

  const glucosaFiltrada = React.useMemo(() => {
    const ahora = new Date();
    const filtrados = historialGlucosaMock.filter(item => {
      const fechaItem = new Date(item.fechaISO);
      if (filtroGlucosa === 'hoy') return fechaItem.toDateString() === ahora.toDateString();
      if (filtroGlucosa === 'semana') {
        const sieteDiasAtras = new Date();
        sieteDiasAtras.setDate(ahora.getDate() - 7);
        return fechaItem >= sieteDiasAtras;
      }
      if (filtroGlucosa === 'mes') {
        const treintaDiasAtras = new Date();
        treintaDiasAtras.setDate(ahora.getDate() - 30);
        return fechaItem >= treintaDiasAtras;
      }
      return true;
    });
    return [...filtrados].reverse();
  }, [filtroGlucosa]);

  const hbA1cFiltrada = React.useMemo(() => {
    const ahora = new Date();
    const filtrados = historialHbA1cMock.filter(item => {
      const fechaItem = new Date(item.fechaISO);
      if (filtroHbA1c === 'trimestre') {
        const tresMesesAtras = new Date();
        tresMesesAtras.setMonth(ahora.getMonth() - 3);
        return fechaItem >= tresMesesAtras;
      }
      if (filtroHbA1c === 'año') {
        const unAñoAtras = new Date();
        unAñoAtras.setFullYear(ahora.getFullYear() - 1);
        return fechaItem >= unAñoAtras;
      }
      return true;
    });
    return [...filtrados].reverse();
  }, [filtroHbA1c]);

  const horasGlucosa = glucosaFiltrada.map(item => item.hora.replace(/\s+/g, ''));
  const nivelesGlucosa = glucosaFiltrada.map(item => item.nivel);
  const fechasHbA1c = hbA1cFiltrada.map(item => item.fecha);
  const resultadosHbA1c = hbA1cFiltrada.map(item => item.resultado);

  return {
    openGlucosa, openHbA1c,
    filtroGlucosa, setFiltroGlucosa,
    filtroHbA1c, setFiltroHbA1c,
    pageGlucosa, setPageGlucosa,
    rowsPerPageGlucosa, setRowsPerPageGlucosa,
    pageHbA1c, setPageHbA1c,
    rowsPerPageHbA1c, setRowsPerPageHbA1c,
    handleOpenGlucosa, handleCloseGlucosa,
    handleOpenHbA1c, handleCloseHbA1c,
    glucosaFiltrada, hbA1cFiltrada,
    horasGlucosa, nivelesGlucosa,
    fechasHbA1c, resultadosHbA1c,
  };
}
