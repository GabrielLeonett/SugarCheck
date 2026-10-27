import { useState } from 'react';
import { Box, Grid, Typography } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateField } from '@mui/x-date-pickers/DateField';
import dayjs, { type Dayjs } from 'dayjs';
import { ButtonBase } from '../../../components/ui/Buttons/ButtonBase';
import {
  medicalExportApi,
  type MedicalExportFormat,
} from '../../../apis/medical_export';
import useLanguage from '../../../hooks/useLanguage';
import { useUiStore } from '../../../stores/uiStore';

export function ExportMedicalDataSection() {
  const { t } = useLanguage('profile');
  const showToast = useUiStore((s) => s.showToast);

  const [from, setFrom] = useState<Dayjs | null>(null);
  const [to, setTo] = useState<Dayjs | null>(null);
  const [loading, setLoading] = useState<MedicalExportFormat | null>(null);

  const handleDownload = async (format: MedicalExportFormat) => {
    if (from && to && from.isAfter(to, 'day')) {
      showToast('error', t('exportInvalidRange'));
      return;
    }

    setLoading(format);
    try {
      await medicalExportApi.download(format, {
        from: from ? from.format('YYYY-MM-DD') : undefined,
        to: to ? to.format('YYYY-MM-DD') : undefined,
      });
      showToast('success', t('exportSuccess'));
    } catch (error) {
      showToast(
        'error',
        error instanceof Error ? error.message : t('exportError'),
      );
    } finally {
      setLoading(null);
    }
  };

  return (
    <Box>
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
        {t('exportDescription')}
      </Typography>

      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Grid container spacing={2} sx={{ maxWidth: 560, mx: 'auto' }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <DateField
              fullWidth
              label={t('exportFrom')}
              format="DD/MM/YYYY"
              value={from}
              onChange={(value) => setFrom(value)}
              maxDate={to ? dayjs(to) : undefined}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <DateField
              fullWidth
              label={t('exportTo')}
              format="DD/MM/YYYY"
              value={to}
              onChange={(value) => setTo(value)}
              minDate={from ? dayjs(from) : undefined}
            />
          </Grid>
          <Grid size={12}>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {t('exportRangeHint')}
            </Typography>
          </Grid>
          <Grid
            size={12}
            sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 1 }}
          >
            <ButtonBase
              variant="contained"
              disabled={loading !== null}
              sx={{
                bgcolor: '#63B3ED',
                '&:hover': { bgcolor: '#4299E1' },
                fontWeight: 'bold',
              }}
              onClick={() => handleDownload('pdf')}
            >
              {loading === 'pdf' ? t('exportPdf') + '…' : t('exportPdf')}
            </ButtonBase>
            <ButtonBase
              variant="outlined"
              disabled={loading !== null}
              onClick={() => handleDownload('csv')}
            >
              {loading === 'csv' ? t('exportCsv') + '…' : t('exportCsv')}
            </ButtonBase>
          </Grid>
        </Grid>
      </LocalizationProvider>
    </Box>
  );
}
