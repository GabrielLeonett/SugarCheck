import { Result } from '../../../src/shared/result';
import { ErrorAbstract } from '../../../src/shared/error-abstract';
import { DatabaseError } from '../../../src/shared/DatabaseError';
import { Preference } from '../../../src/preference/core/Preference';

type PreferenceResult = Result<Preference, ErrorAbstract>;

export class StubPreferenceLookup {
  public response: PreferenceResult | null = null;
  public calls: { id: string }[] = [];

  public setResponse(response: PreferenceResult): void {
    this.response = response;
  }

  public setPreferencePlain(plain: {
    unitMeasure: string;
    thresholds: { hypo: number; hiper: number };
  }): void {
    this.response = Result.ok({
      toPlain: () => plain,
    } as unknown as Preference);
  }

  async run(data: { id: string }): Promise<PreferenceResult> {
    this.calls.push(data);
    if (this.response) return this.response;
    return Result.fail(
      new DatabaseError('Sin preferencias configuradas (stub)'),
    );
  }
}
