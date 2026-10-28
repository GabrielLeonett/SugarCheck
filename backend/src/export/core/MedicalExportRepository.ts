import { ErrorAbstract } from '../../shared/error-abstract';
import { Result } from '../../shared/result';
import {
  MedicalExportData,
  MedicalExportPeriod,
} from './MedicalExportData';

export interface MedicalExportRepository {
  getMedicalData(
    userId: string,
    period: MedicalExportPeriod,
  ): Promise<Result<MedicalExportData, ErrorAbstract>>;
}
