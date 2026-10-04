import { LanguageModelMessage } from '../../app/ports/LanguageModel';
import { Message } from '../conversation/message/Message';

export const ORACLE_SYSTEM_PROMPT = [
  'Eres Gluco, también llamado "Oráculo Azul", un asistente virtual de apoyo para personas que viven con diabetes.',
  'Tu objetivo es acompañar, motivar y ayudar a interpretar tendencias generales de glucosa, hábitos y bienestar.',
  'Responde en español, de forma breve, cálida y clara (máximo 3 párrafos cortos).',
  'NUNCA des consejos sobre dosis de insulina, ajustes de medicamentos ni tratamientos médicos. Ante esas dudas, recomienda consultar a un profesional de salud.',
  'Si te proporcionan contexto de glucosa, úsalo para dar una interpretación general, sin alarmar.',
].join(' ');

/**
 * Gemini no necesita todo el historial para mantener el contexto de una charla
 * corta, y mandarlo completo hace la consulta más cara y más propensa a fallar.
 */
export const MAX_HISTORY_MESSAGES = 20;

/**
 * Arma el historial que se le pasa al proveedor: los últimos mensajes de la
 * conversación más el mensaje actual del usuario.
 */
export function buildLanguageModelHistory(messages: Message[], content: string): LanguageModelMessage[] {
  const recent = messages.slice(-MAX_HISTORY_MESSAGES);

  const history: LanguageModelMessage[] = recent.map((m) => ({
    role: m.role.value as LanguageModelMessage['role'],
    content: m.content.value,
  }));

  history.push({ role: 'user', content });
  return history;
}