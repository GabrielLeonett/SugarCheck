import type { ThemeColors } from '@/constants/theme';

export type GlucoseRangeStatus = 'low' | 'inRange' | 'high';

export function getGlucoseRangeStatus(
  value: number,
  thresholds: { hypo: number; hiper: number }
): GlucoseRangeStatus {
  if (value <= thresholds.hypo) return 'low';
  if (value >= thresholds.hiper) return 'high';
  return 'inRange';
}

export function getGlucoseStatusColor(status: GlucoseRangeStatus, colors: ThemeColors): string {
  if (status === 'low') return colors.error.main;
  if (status === 'high') return colors.warning.main;
  return colors.success.main;
}

export function getRangeDominanceColor(percentage: number, colors: ThemeColors): string {
  if (percentage >= 70) return colors.success.main;
  if (percentage >= 50) return colors.warning.main;
  return colors.error.main;
}
