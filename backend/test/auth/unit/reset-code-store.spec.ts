import { ResetCodeStore } from '../../../src/auth/infra/ResetCodeStore';

describe('ResetCodeStore', () => {
  let store: ResetCodeStore;

  beforeEach(() => {
    store = new ResetCodeStore();
  });

  test('acepta el código correcto (email sin distinguir mayúsculas)', async () => {
    await store.store('Gabriel@Test.com', '123456');

    await expect(
      store.verify('gabriel@test.com', '123456'),
    ).resolves.toBe(true);
  });

  test('rechaza un código incorrecto', async () => {
    await store.store('gabriel@test.com', '123456');

    await expect(
      store.verify('gabriel@test.com', '000000'),
    ).resolves.toBe(false);
  });

  test('invalida el código tras 5 intentos fallidos', async () => {
    await store.store('gabriel@test.com', '123456');

    for (let attempt = 0; attempt < 5; attempt += 1) {
      await expect(
        store.verify('gabriel@test.com', '000000'),
      ).resolves.toBe(false);
    }

    // Aunque ahora use el código correcto, ya fue bloqueado.
    await expect(
      store.verify('gabriel@test.com', '123456'),
    ).resolves.toBe(false);
  });

  test('un código nuevo reinicia los intentos', async () => {
    await store.store('gabriel@test.com', '123456');

    for (let attempt = 0; attempt < 4; attempt += 1) {
      await store.verify('gabriel@test.com', '000000');
    }

    await store.store('gabriel@test.com', '654321');

    await expect(
      store.verify('gabriel@test.com', '654321'),
    ).resolves.toBe(true);
  });

  test('elimina el código después de usarlo', async () => {
    await store.store('gabriel@test.com', '123456');
    await store.delete('gabriel@test.com');

    await expect(
      store.verify('gabriel@test.com', '123456'),
    ).resolves.toBe(false);
  });
});
