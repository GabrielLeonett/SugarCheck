import { HttpStatus } from '@nestjs/common';
import { ErrorAbstract } from '../error-abstract';

export interface ErrorMapping {
  statusCode: HttpStatus;
  code: string;
}

const errorMap = new Map<string, ErrorMapping>();

const DEFAULT_MAPPING: ErrorMapping = {
  statusCode: HttpStatus.BAD_REQUEST,
  code: 'DOMAIN_ERROR',
};

export function registerErrorMapping(errorName: string, mapping: ErrorMapping) {
  errorMap.set(errorName, mapping);
}

export function getMapping(error: ErrorAbstract): ErrorMapping {
  return errorMap.get(error.name) ?? DEFAULT_MAPPING;
}

export function getHttpStatus(error: ErrorAbstract): number {
  return getMapping(error).statusCode;
}

export function getErrorCode(error: ErrorAbstract): string {
  return error.code ?? getMapping(error).code;
}

registerErrorMapping('UserIdInvalidError', { statusCode: HttpStatus.BAD_REQUEST, code: 'INVALID_ID' });
registerErrorMapping('DatabaseError', { statusCode: HttpStatus.INTERNAL_SERVER_ERROR, code: 'DATABASE_ERROR' });

registerErrorMapping('UserNotFoundError', { statusCode: HttpStatus.NOT_FOUND, code: 'USER_NOT_FOUND' });
registerErrorMapping('UserAlreadyExists', { statusCode: HttpStatus.CONFLICT, code: 'USER_ALREADY_EXISTS' });
registerErrorMapping('UserNameInvalidError', { statusCode: HttpStatus.BAD_REQUEST, code: 'INVALID_NAME' });
registerErrorMapping('UserEmailInvalidError', { statusCode: HttpStatus.BAD_REQUEST, code: 'INVALID_EMAIL' });
registerErrorMapping('UserUsernameInvalidError', { statusCode: HttpStatus.BAD_REQUEST, code: 'INVALID_USERNAME' });
registerErrorMapping('UserPasswordInvalidError', { statusCode: HttpStatus.BAD_REQUEST, code: 'INVALID_PASSWORD' });
registerErrorMapping('UserSexoInvalidError', { statusCode: HttpStatus.BAD_REQUEST, code: 'INVALID_SEXO' });
registerErrorMapping('UserRoleInvalidError', { statusCode: HttpStatus.BAD_REQUEST, code: 'INVALID_ROLE' });
registerErrorMapping('UserDateInvalidError', { statusCode: HttpStatus.BAD_REQUEST, code: 'INVALID_DATE' });

registerErrorMapping('InvalidCredentialsError', { statusCode: HttpStatus.UNAUTHORIZED, code: 'INVALID_CREDENTIALS' });
registerErrorMapping('InvalidTokenError', { statusCode: HttpStatus.UNAUTHORIZED, code: 'INVALID_TOKEN' });
registerErrorMapping('ExpiredTokenError', { statusCode: HttpStatus.UNAUTHORIZED, code: 'EXPIRED_TOKEN' });
registerErrorMapping('TokenRevokedError', { statusCode: HttpStatus.UNAUTHORIZED, code: 'TOKEN_REVOKED' });
registerErrorMapping('MissingTokenError', { statusCode: HttpStatus.UNAUTHORIZED, code: 'MISSING_TOKEN' });
registerErrorMapping('WeakPasswordError', { statusCode: HttpStatus.BAD_REQUEST, code: 'WEAK_PASSWORD' });
registerErrorMapping('UnverifiedUserError', { statusCode: HttpStatus.FORBIDDEN, code: 'UNVERIFIED_USER' });
registerErrorMapping('TooManyAttemptsError', { statusCode: HttpStatus.TOO_MANY_REQUESTS, code: 'TOO_MANY_ATTEMPTS' });
registerErrorMapping('PasswordExpiredError', { statusCode: HttpStatus.UNAUTHORIZED, code: 'PASSWORD_EXPIRED' });
registerErrorMapping('AccountSuspendedError', { statusCode: HttpStatus.FORBIDDEN, code: 'ACCOUNT_SUSPENDED' });

registerErrorMapping('ContactNotFoundError', { statusCode: HttpStatus.NOT_FOUND, code: 'CONTACT_NOT_FOUND' });
registerErrorMapping('ContactNameInvalidError', { statusCode: HttpStatus.BAD_REQUEST, code: 'INVALID_CONTACT_NAME' });
registerErrorMapping('ContactParentescoInvalidError', { statusCode: HttpStatus.BAD_REQUEST, code: 'INVALID_PARENTESCO' });

registerErrorMapping('PreferenceIdInvalidError', { statusCode: HttpStatus.BAD_REQUEST, code: 'INVALID_PREFERENCE_ID' });
registerErrorMapping('ThresholdInvalidError', { statusCode: HttpStatus.BAD_REQUEST, code: 'INVALID_THRESHOLD' });
registerErrorMapping('SensitivityInvalidError', { statusCode: HttpStatus.BAD_REQUEST, code: 'INVALID_SENSITIVITY' });
registerErrorMapping('RatioInvalidError', { statusCode: HttpStatus.BAD_REQUEST, code: 'INVALID_RATIO' });
registerErrorMapping('ProfileImgInvalidError', { statusCode: HttpStatus.BAD_REQUEST, code: 'INVALID_PROFILE_IMG' });
registerErrorMapping('ConfigUnitInvalidErorr', { statusCode: HttpStatus.BAD_REQUEST, code: 'INVALID_UNIT' });

registerErrorMapping('NotificationNotFoundError', { statusCode: HttpStatus.NOT_FOUND, code: 'NOTIFICATION_NOT_FOUND' });

registerErrorMapping('ResetTokenInvalidError', { statusCode: HttpStatus.BAD_REQUEST, code: 'RESET_TOKEN_INVALID' });
registerErrorMapping('ResetTokenExpiredError', { statusCode: HttpStatus.GONE, code: 'RESET_TOKEN_EXPIRED' });

registerErrorMapping('GlucoseNotFoundError', { statusCode: HttpStatus.NOT_FOUND, code: 'GLUCOSE_NOT_FOUND' });
registerErrorMapping('GlucoseValueInvalidError', { statusCode: HttpStatus.BAD_REQUEST, code: 'INVALID_GLUCOSE_VALUE' });
registerErrorMapping('GlucoseMealTagInvalidError', { statusCode: HttpStatus.BAD_REQUEST, code: 'INVALID_MEAL_TAG' });
registerErrorMapping('HbA1cNotFoundError', { statusCode: HttpStatus.NOT_FOUND, code: 'HBA1C_NOT_FOUND' });
registerErrorMapping('HbA1cValueInvalidError', { statusCode: HttpStatus.BAD_REQUEST, code: 'INVALID_HBA1C_VALUE' });
registerErrorMapping('EditWindowExpiredError', { statusCode: HttpStatus.FORBIDDEN, code: 'EDIT_WINDOW_EXPIRED' });
registerErrorMapping('GlucoseIdInvalidError', { statusCode: HttpStatus.BAD_REQUEST, code: 'INVALID_GLUCOSE_ID' });
registerErrorMapping('GlucoseDateInvalidError', { statusCode: HttpStatus.BAD_REQUEST, code: 'INVALID_GLUCOSE_DATE' });
registerErrorMapping('GlucoseTimeInvalidError', { statusCode: HttpStatus.BAD_REQUEST, code: 'INVALID_GLUCOSE_TIME' });
registerErrorMapping('HbA1cIdInvalidError', { statusCode: HttpStatus.BAD_REQUEST, code: 'INVALID_HBA1C_ID' });
registerErrorMapping('HbA1cExamDateInvalidError', { statusCode: HttpStatus.BAD_REQUEST, code: 'INVALID_HBA1C_DATE' });
