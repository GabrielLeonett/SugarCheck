import * as React from 'react';
// Importación de los mocks externos
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
  const obtenerFechaActual = () => {
    const hoy = new Date();
    const offset = hoy.getTimezoneOffset();
    const fechaLocal = new Date(hoy.getTime() - offset * 60 * 1000);
    return fechaLocal.toISOString().split('T')[0];
  };

  const obtenerHoraActual = () => {
    const ahora = new Date();
    const horas = String(ahora.getHours()).padStart(2, '0');
    const minutos = String(ahora.getMinutes()).padStart(2, '0');
    return `${horas}:${minutos}`;
  };

  // --- ESTADOS DE UI & FORMULARIOS ---
  const [fechaGlucosa, setFechaGlucosa] = React.useState("");
  const [hora, setHora] = React.useState("");
  const [contexto, setContexto] = React.useState("");
  const [nivelGlucosaInput, setNivelGlucosaInput] = React.useState(""); 

  const [fechaHbA1c, setFechaHbA1c] = React.useState("");
  const [resultadoHbA1cInput, setResultadoHbA1cInput] = React.useState(""); 
  
  const [openGlucosa, setOpenGlucosa] = React.useState(false);
  const [openHbA1c, setOpenHbA1c] = React.useState(false);

  // Filtros temporales
  const [filtroGlucosa, setFiltroGlucosa] = React.useState<'hoy' | 'semana' | 'mes'>('mes');
  const [filtroHbA1c, setFiltroHbA1c] = React.useState<'trimestre' | 'año' | 'todos'>('todos');

  // Paginación
  const [pageGlucosa, setPageGlucosa] = React.useState(0);
  const [rowsPerPageGlucosa, setRowsPerPageGlucosa] = React.useState(4);
  const [pageHbA1c, setPageHbA1c] = React.useState(0);
  const [rowsPerPageHbA1c, setRowsPerPageHbA1c] = React.useState(4);

  // --- HANDLERS CONTROLADORES ---
  const handleOpenGlucosa = () => {
    setFechaGlucosa(obtenerFechaActual());
    setHora(obtenerHoraActual());
    setOpenGlucosa(true);
  };

  const handleCloseGlucosa = () => {
    setOpenGlucosa(false);
    setContexto(""); 
    setNivelGlucosaInput("");
  };

  const handleOpenHbA1c = () => {
    setFechaHbA1c(obtenerFechaActual());
    setOpenHbA1c(true);
  };

  const handleCloseHbA1c = () => {
    setOpenHbA1c(false);
    setResultadoHbA1cInput("");
  };

  // --- PROCESAMIENTO DE FILTROS (Lógica de negocio basada en el mock importado) ---
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

  // Derivación de primitivos para MUI X-Charts
  const horasGlucosa = glucosaFiltrada.map(item => item.hora.replace(/\s+/g, ''));
  const nivelesGlucosa = glucosaFiltrada.map(item => item.nivel);
  const fechasHbA1c = hbA1cFiltrada.map(item => item.fecha);
  const resultadosHbA1c = hbA1cFiltrada.map(item => item.resultado);

  return {
    // Estados y setters compartidos o locales
    fechaGlucosa, setFechaGlucosa,
    hora, setHora,
    contexto, setContexto,
    nivelGlucosaInput, setNivelGlucosaInput,
    fechaHbA1c, setFechaHbA1c,
    resultadoHbA1cInput, setResultadoHbA1cInput,
    openGlucosa, openHbA1c,
    filtroGlucosa, setFiltroGlucosa,
    filtroHbA1c, setFiltroHbA1c,
    pageGlucosa, setPageGlucosa,
    rowsPerPageGlucosa, setRowsPerPageGlucosa,
    pageHbA1c, setPageHbA1c,
    rowsPerPageHbA1c, setRowsPerPageHbA1c,
    
    // Handlers
    handleOpenGlucosa, handleCloseGlucosa,
    handleOpenHbA1c, handleCloseHbA1c,
    
    // Datos procesados y Gráficos
    glucosaFiltrada, hbA1cFiltrada,
    horasGlucosa, nivelesGlucosa,
    fechasHbA1c, resultadosHbA1c
  };
}