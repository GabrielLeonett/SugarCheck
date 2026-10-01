import { Result } from '../../../shared/result';
import { UnsafeMedicalRequestError } from '../conversation/errors/UnsafeMedicalRequestError';

const BLOCKED_PATTERNS: RegExp[] = [
  /(cu[aá]nt[aos]?\s+insulina|dosis\s+de\s+insulina|cu[aá]nta\s+insulina)/i,
  /(ajust[aá]r|subir|bajar|cambiar)\s+.*\b(insulina|medicamento|medicina)\b/i,
  /\b(dosis|medicamento|medicina|f[aá]rmaco|pastilla|metformina|glibenclamida|insulina)\b\s*.*\b(debo|deber[ií]a|tomo|tomar|cu[aá]nto|cu[aá]nta)\b/i,
  /\b(debo|deber[ií]a)\b\s+.*\b(tomar|inyectarme|aplicarme|consumir)\b.*\b(insulina|medicamento|medicina)\b/i,
  /\b(cu[aá]nto|cu[aá]nta)\b\s+.*\b(insulina|medicamento|medicina)\b/i,
];

export class MedicalSafetyPolicy {
  public evaluate(content: string): Result<string, UnsafeMedicalRequestError> {
    const matchesBlocked = BLOCKED_PATTERNS.some((pattern) => pattern.test(content));
    if (matchesBlocked) {
      return Result.fail(
        new UnsafeMedicalRequestError().withCode('UNSAFE_MEDICAL_REQUEST', 'content'),
      );
    }
    return Result.ok(content);
  }
}
