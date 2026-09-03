import { Box, Typography, ButtonGroup, Button } from '@mui/material';
import { PanelGraficoHistorial } from '../../../components/shared/PanelGraficoHistorial';
import HistorialTable from '../../../components/shared/HistorialTable';
import { GraficoLinea } from '../../../components/shared/GraficoLinea';
import { useInsulinaData } from '../../../hooks/useInsulinaData';
import useLanguage from '../../../hooks/useLanguage';
import type { InsulinRecord } from '../../../apis/insulina';
import type { Column } from '../../../components/shared/HistorialTable';

interface InsulinaHistorialProps {
  refreshTrigger?: number;
}

export default function InsulinaHistorial({ refreshTrigger = 0 }: InsulinaHistorialProps) {
  const { t } = useLanguage('insulinaHistorial');

  const {
    registros,
    error,
    timeRange,
    setTimeRange,
    customRange,
    setCustomRange,
    tipoFilter,
    setTipoFilter,
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    horasInsulina,
    dosisInsulina,
  } = useInsulinaData(refreshTrigger);

  const obtenerColorTipo = (tipo: string) => {
    if (tipo === 'LENTA') return 'warning.light';
    if (tipo === 'RAPIDA') return 'info.light';
    return 'text.primary';
  };

  const obtenerTipoLabel = (tipo: string) => {
    return tipo === 'LENTA' ? 'Lenta / Basal' : 'Rápida / Bolus';
  };

  const formatHora = (hora: string) => {
    const [h, m] = hora.split(':');
    const hour = parseInt(h, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${m} ${ampm}`;
  };

  const columns: Column<InsulinRecord>[] = [
    { key: 'hora', label: t('hora'), render: (row) => formatHora(row.hora) },
    { key: 'dosis', label: t('dosis'), render: (row) => <Box sx={{ fontWeight: 700 }}>{row.dosis} UI</Box> },
    {
      key: 'tipo',
      label: t('tipo'),
      render: (row) => (
        <Box sx={{ fontWeight: 700, color: obtenerColorTipo(row.tipo) }}>
          {obtenerTipoLabel(row.tipo)}
        </Box>
      ),
    },
    { key: 'zona', label: t('zona'), render: (row) => row.zonaLabel },
    { key: 'contexto', label: t('contexto'), render: (row) => row.contextoLabel || '-' },
  ];

  const chartComponent = (
    <GraficoLinea
      data={dosisInsulina}
      labels={horasInsulina}
      color={tipoFilter === 'lenta' ? '#FFA726' : '#4FC3F7'}
      label={t('dosisUi')}
      emptyMessage={t('noHayRegistrosGraficar')}
    />
  );

  const timeFilterOptions = ['hoy', 'semana', 'mes', 'trimestre', 'año', 'todos'] as const;

  const filterComponent = (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center' }}>
      <ButtonGroup variant="outlined" size="small" aria-label={t('grafico.filtros.ariaLabel')}>
        {timeFilterOptions.map((filtro) => (
          <Button
            key={filtro}
            onClick={() => {
              setTimeRange(filtro);
              setCustomRange(null);
            }}
            variant={timeRange === filtro ? 'contained' : 'outlined'}
          >
            {filtro === 'hoy' ? t('grafico.filtros.hoy') : filtro === 'semana' ? t('grafico.filtros.semana') : filtro === 'mes' ? t('grafico.filtros.mes') : filtro === 'trimestre' ? t('grafico.filtros.trimestre') : filtro === 'año' ? t('grafico.filtros.año') : t('grafico.filtros.todos')}
          </Button>
        ))}
      </ButtonGroup>
      {timeRange === 'personalizado' && customRange && (
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', fontSize: '0.75rem', color: 'text.secondary' }}>
          <Typography variant="caption">{customRange.start}</Typography>
          <Typography variant="caption">–</Typography>
          <Typography variant="caption">{customRange.end}</Typography>
        </Box>
      )}
      <ButtonGroup variant="outlined" size="small" aria-label={t('filtroTipo.ariaLabel')} sx={{ ml: { xs: 0, sm: 1 } }}>
        <Button
          onClick={() => setTipoFilter('todas')}
          variant={tipoFilter === 'todas' ? 'contained' : 'outlined'}
        >
          {t('todas')}
        </Button>
        <Button
          onClick={() => setTipoFilter('lenta')}
          variant={tipoFilter === 'lenta' ? 'contained' : 'outlined'}
        >
          {t('lenta')}
        </Button>
        <Button
          onClick={() => setTipoFilter('rapida')}
          variant={tipoFilter === 'rapida' ? 'contained' : 'outlined'}
        >
          {t('rapida')}
        </Button>
      </ButtonGroup>
    </Box>
  );

  if (error && registros.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6" color="primary.dark" sx={{ fontWeight: 600, mb: 2 }}>
          {t('evolucionInsulina')}
        </Typography>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <PanelGraficoHistorial
      chartTitle={t('evolucionInsulina')}
      filterComponent={filterComponent}
      chartComponent={chartComponent}
      tableTitle={t('historialRegistros')}
      tableComponent={
        <HistorialTable<InsulinRecord>
          columns={columns}
          data={registros}
          page={page}
          rowsPerPage={rowsPerPage}
          totalCount={registros.length}
          onPageChange={(_, newPage: number) => setPage(newPage)}
          onRowsPerPageChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[4, 10, 25]}
          emptyMessage={t('noHayRegistrosFiltro')}
          labelRowsPerPage={t('filasPorPagina')}
          ariaLabel={t('tabla.ariaLabel')}
        />
      }
    />
  );
}