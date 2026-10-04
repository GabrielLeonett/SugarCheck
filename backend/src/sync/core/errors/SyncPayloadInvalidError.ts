import { ErrorAbstract } from '../../../shared/error-abstract';

export class SyncPayloadInvalidError extends ErrorAbstract {
  constructor(message: string) {
    super(message, { code: 'SYNC_PAYLOAD_INVALID', origin: 'domain' });
  }
}
