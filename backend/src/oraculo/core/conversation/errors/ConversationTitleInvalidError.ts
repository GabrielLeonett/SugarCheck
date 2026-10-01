import { ErrorAbstract } from '../../../../shared/error-abstract';

export class ConversationTitleInvalidError extends ErrorAbstract {
  constructor(message: string = 'El título de la conversación no es válido') {
    super(message, { code: 'CONVERSATION_TITLE_INVALID' });
  }
}
