import { UserSexoInvalidError } from '../errors/UserSexoInvalidError';
import { Result } from '../../../shared/result';
import { Sexo } from '../../../shared/enums/sexo.enum';

export class UserSexo {
  public readonly value: Sexo;
  private constructor(value: Sexo) {
    this.value = value;
  }

  public static create(
    value: string,
  ): Result<UserSexo, UserSexoInvalidError> {
    const sexoValues = Object.values(Sexo) as string[];
    if (!sexoValues.includes(value)) {
      return Result.fail(
        new UserSexoInvalidError(
          `El sexo debe ser uno de: ${sexoValues.join(', ')}`,
        ),
      );
    }

    return Result.ok(new UserSexo(value as Sexo));
  }
}
