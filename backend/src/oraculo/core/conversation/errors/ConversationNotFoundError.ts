import { ErrorAbstract } from '../../../../shared/error-abstract';

export class ConversationNotFoundError extends ErrorAbstract {
  constructor(message: string = 'Conversación no encontrada') {
    super(message, { code: 'CONVERSATION_NOT_FOUND' });
  }
}
