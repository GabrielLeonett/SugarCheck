import { ErrorAbstract } from '../../../shared/error-abstract';
import { Result } from '../../../shared/result';

export type LanguageModelRole = 'user' | 'assistant' | 'system';

export interface LanguageModelMessage {
  role: LanguageModelRole;
  content: string;
}

export interface GenerateResponseParams {
  systemPrompt: string;
  messages: LanguageModelMessage[];
  context?: string;
}

export interface LanguageModel {
  generateResponse(params: GenerateResponseParams): Promise<Result<string, ErrorAbstract>>;
}
