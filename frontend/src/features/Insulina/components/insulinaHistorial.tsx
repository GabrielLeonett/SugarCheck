import { Box, Typography, ButtonGroup, Button } from '@mui/material';
import { useState } from 'react';
import { PanelGraficoHistorial } from '../../../components/shared/PanelGraficoHistorial';
import HistorialTable from '../../../components/shared/HistorialTable';
import { GraficoLinea } from '../../../components/shared/GraficoLinea';
import { TimeRangeFilter } from '../../../components/shared/TimeRangeFilter';
import { EditActionButton } from '../../../components/shared/EditActionButton';
import ModalInsulinaLenta from './ModalInsulinaLenta';
import ModalInsulinaRapida from './ModalInsulinaRapida';
import { useInsulinaData } from '../../../hooks/useInsulinaData';
import { canEditRecord } from '../../../utils/editWindow';
import { useUiStore } from '../../../stores/uiStore';
import useLanguage from '../../../hooks/useLanguage';
import { insulinaApi } from '../../../apis/insulina';
import type { InsulinRecord } from '../../../apis/insulina';
import type { Column } from '../../../components/shared/HistorialTable';

interface InsulinaHistorialProps {
  refreshTrigger?: number;
}

export default function InsulinaHistorial({ refreshTrigger = 0 }: InsulinaHistorialProps) {
  const { t } = useLanguage('insulinaHistorial');
  const { t: tEdit } = useLanguage('editRecord');
  const showToast = useUiStore((s) => s.showToast);
  const [editing, setEditing] = useState<InsulinRecord | null>(null);

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
    refresh,
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

  const formatFecha = (iso: string) => {
    const date = new Date(iso);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${day}/${month}/${date.getFullYear()}`;
  };

  const columns: Column<InsulinRecord>[] = [
    { key: 'fecha', label: t('fecha'), render: (row) => formatFecha(row.fecha) },
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
    {
      key: 'acciones',
      label: tEdit('actions'),
      render: (row) => (
        <EditActionButton
          canEdit={canEditRecord(row.createdAt)}
          onClick={() => setEditing(row)}
          editLabel={tEdit('edit')}
          expiredLabel={tEdit('editExpired')}
        />
      ),
    },
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

  const filterComponent = (
    <TimeRangeFilter
      value={timeRange}
      onChange={setTimeRange}
      presets={['hoy', 'semana', 'mes', 'trimestre', 'año', 'todos']}
      customRange={customRange}
      onCustomRangeChange={setCustomRange}
      getPresetLabel={(filtro) => t(filtro === 'año' ? 'anio' : filtro)}
      personalizadoLabel={t('personalizado')}
      startLabel={t('fechaInicio')}
      endLabel={t('fechaFin')}
      ariaLabel={t('filtroTiempoAriaLabel')}
      extra={
        <ButtonGroup variant="outlined" size="small" aria-label={t('filtroTipoAriaLabel')} sx={{ ml: { xs: 0, sm: 1 } }}>
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
      }
    />
  );

  const handleUpdate = async (data: {
    dosis: number;
    contexto?: string;
    dia: number;
    mes: number;
    anio: number;
    hora: string;
    zona: string;
  }) => {
    if (!editing) return;
    await insulinaApi.update(editing.id, data);
    refresh();
    showToast('success', tEdit('updateSuccess'), tEdit('editInsulinTitle'));
  };

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
    <>
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

      {editing?.tipo === 'RAPIDA' && (
        <ModalInsulinaRapida
          open
          onClose={() => setEditing(null)}
          onSave={handleUpdate}
          record={editing}
          title={tEdit('editInsulinTitle')}
          submitLabel={tEdit('saveChanges')}
        />
      )}

      {editing?.tipo === 'LENTA' && (
        <ModalInsulinaLenta
          open
          onClose={() => setEditing(null)}
          onSave={handleUpdate}
          record={editing}
          title={tEdit('editInsulinTitle')}
          submitLabel={tEdit('saveChanges')}
        />
      )}
    </>
  );
}