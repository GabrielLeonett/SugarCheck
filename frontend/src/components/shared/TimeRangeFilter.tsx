import { Box, Button, ButtonGroup, TextField } from '@mui/material';
import type { ReactNode } from 'react';
import type { CustomDateRange, TimeRange } from '../../hooks/useMetricData';

interface TimeRangeFilterProps {
  value: TimeRange;
  onChange: (range: TimeRange) => void;
  /** Presets estáticos mostrados (sin incluir 'personalizado', que se añade siempre). */
  presets: readonly TimeRange[];
  customRange: CustomDateRange | null;
  onCustomRangeChange: (range: CustomDateRange | null) => void;
  getPresetLabel: (range: TimeRange) => string;
  personalizadoLabel: string;
  startLabel: string;
  endLabel: string;
  ariaLabel?: string;
  /** Slot opcional para filtros adicionales (tipo, año, etc.). */
  extra?: ReactNode;
}

export function TimeRangeFilter({
  value,
  onChange,
  presets,
  customRange,
  onCustomRangeChange,
  getPresetLabel,
  personalizadoLabel,
  startLabel,
  endLabel,
  ariaLabel,
  extra,
}: TimeRangeFilterProps) {
  const showCustom = value === 'personalizado';

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center' }}>
      <ButtonGroup variant="outlined" size="small" aria-label={ariaLabel}>
        {presets.map((preset) => (
          <Button
            key={preset}
            onClick={() => onChange(preset)}
            variant={value === preset ? 'contained' : 'outlined'}
          >
            {getPresetLabel(preset)}
          </Button>
        ))}
        <Button
          onClick={() => onChange('personalizado')}
          variant={value === 'personalizado' ? 'contained' : 'outlined'}
        >
          {personalizadoLabel}
        </Button>
      </ButtonGroup>

      {showCustom && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
          <TextField
            type="date"
            size="small"
            label={startLabel}
            slotProps={{ inputLabel: { shrink: true } }}
            value={customRange?.start ?? ''}
            onChange={(event) =>
              onCustomRangeChange({
                start: event.target.value,
                end: customRange?.end ?? '',
              })
            }
          />
          <TextField
            type="date"
            size="small"
            label={endLabel}
            slotProps={{ inputLabel: { shrink: true } }}
            value={customRange?.end ?? ''}
            onChange={(event) =>
              onCustomRangeChange({
                start: customRange?.start ?? '',
                end: event.target.value,
              })
            }
          />
        </Box>
      )}

      {extra}
    </Box>
  );
}
