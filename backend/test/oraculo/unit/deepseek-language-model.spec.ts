import { DeepSeekLanguageModel } from '../../../src/oraculo/infra/language-model/DeepSeekLanguageModel';

const params = {
  systemPrompt: 'Eres Gluco.',
  messages: [
    { role: 'user' as const, content: 'Hola' },
    { role: 'assistant' as const, content: '¡Hola!' },
    { role: 'user' as const, content: '¿Cómo estoy?' },
  ],
  context: 'Glucosa: 110 mg/dL',
};

describe('DeepSeekLanguageModel', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it('envía el modelo deepseek-flash sin razonamiento y devuelve el texto', async () => {
    const fetchMock = jest.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          choices: [
            {
              message: { role: 'assistant', content: '  Todo bien.  ' },
              finish_reason: 'stop',
            },
          ],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    );
    global.fetch = fetchMock as unknown as typeof fetch;

    const model = new DeepSeekLanguageModel('test-key', 'deepseek-flash');
    const result = await model.generateResponse(params);

    expect(result.isValid).toBe(true);
    expect(result.getValue()).toBe('Todo bien.');

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://api.deepseek.com/chat/completions');
    expect((init.headers as Record<string, string>).Authorization).toBe(
      'Bearer test-key',
    );

    const body = JSON.parse(init.body as string);
    expect(body.model).toBe('deepseek-flash');
    expect(body.thinking).toEqual({ type: 'disabled' });
    expect(body.stream).toBe(false);
    expect(body.messages[0]).toEqual({
      role: 'system',
      content:
        'Eres Gluco.\n\nContexto de glucosa del usuario:\nGlucosa: 110 mg/dL',
    });
    expect(body.messages.slice(1)).toEqual(params.messages);
  });

  it('lee el stream SSE y concatena solo el contenido final', async () => {
    const encoder = new TextEncoder();
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(
          encoder.encode(
            'data: {"choices":[{"delta":{"reasoning_content":"pienso..."},"finish_reason":null}]}\n\n',
          ),
        );
        controller.enqueue(
          encoder.encode(
            'data: {"choices":[{"delta":{"content":"Hola"},"finish_reason":null}]}\n\n',
          ),
        );
        controller.enqueue(
          encoder.encode(
            'data: {"choices":[{"delta":{"content":" mundo"},"finish_reason":"stop"}]}\n\n',
          ),
        );
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      },
    });

    global.fetch = jest
      .fn()
      .mockResolvedValue(
        new Response(stream, {
          status: 200,
          headers: { 'Content-Type': 'text/event-stream' },
        }),
      ) as unknown as typeof fetch;

    const model = new DeepSeekLanguageModel('test-key', 'deepseek-flash');
    const chunks: string[] = [];
    for await (const chunk of model.streamResponse(params)) {
      chunks.push(chunk);
    }

    expect(chunks.join('')).toBe('Hola mundo');
  });

  it('traduce el error de saldo insuficiente', async () => {
    global.fetch = jest.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          error: {
            message: 'Insufficient Balance',
            type: 'insufficient_balance_error',
          },
        }),
        { status: 402, headers: { 'Content-Type': 'application/json' } },
      ),
    ) as unknown as typeof fetch;

    const model = new DeepSeekLanguageModel('test-key', 'deepseek-flash');
    const result = await model.generateResponse(params);

    expect(result.isValid).toBe(false);
    expect(result.getError().message).toBe(
      'El proveedor de IA no tiene saldo disponible en este momento.',
    );
  });
});
