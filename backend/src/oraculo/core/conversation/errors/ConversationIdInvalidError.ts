import { ErrorAbstract } from '../../../../shared/error-abstract';

export class ConversationIdInvalidError extends ErrorAbstract {
  constructor(message: string = 'El ID de conversación no es válido') {
    super(message, { code: 'CONVERSATION_ID_INVALID' });
  }
}
