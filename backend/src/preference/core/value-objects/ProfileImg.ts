import { Result } from '../../../shared/result';
import { ProfileImgInvalidError } from '../errors/ProfileImgInvalidError';

export class ProfileImg {
  public readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  public static create(value: string): Result<ProfileImg, ProfileImgInvalidError> {
    
    // 1. Validar que no sea nulo, undefined o contenga solo espacios
    if (!value || value.trim().length === 0) {
      return Result.fail(
        new ProfileImgInvalidError('La URL o ruta de la imagen es requerida').withCode('PROFILE_IMG_REQUIRED', 'profileImg'),
      );
    }

    // 2. Validación básica de longitud (ejemplo: mínimo 5 caracteres)
    // Esto asegura que al menos sea algo como "/a.png" o "http://b.io"
    if (value.trim().length < 5) {
      return Result.fail(
        new ProfileImgInvalidError('La ruta de la imagen es demasiado corta').withCode('PROFILE_IMG_TOO_SHORT', 'profileImg'),
      );
    }

    // Si pasas estas validaciones, devolvemos el objeto
    return Result.ok(new ProfileImg(value.trim()));
  }
}