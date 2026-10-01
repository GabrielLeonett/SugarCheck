import { ErrorAbstract } from '../../../../shared/error-abstract';

export class ConversationAccessDeniedError extends ErrorAbstract {
  constructor(message: string = 'No tienes permiso para acceder a esta conversación') {
    super(message, { code: 'CONVERSATION_ACCESS_DENIED' });
  }
}
