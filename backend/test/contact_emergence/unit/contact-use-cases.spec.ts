import { InMemoryContactEmergenceRepository } from '../mocks/contact-emergence-repository.mock';
import { GenerateUUID } from '../../shared/mocks/generate-uuid.mock';
import { ContactEmergenceFactory } from '../fixtures/contact-emergence.fixture';
import { SaveContactEmergence } from '../../../src/contact_emergence/app/SaveContactEmergence';
import { GetAllContactsByUserId } from '../../../src/contact_emergence/app/GetAllContactsByUserId';
import { GetOneContactById } from '../../../src/contact_emergence/app/GetOneContactById';
import { UpdateContactEmergence } from '../../../src/contact_emergence/app/UpdateContactEmergence';
import { DeleteContactEmergence } from '../../../src/contact_emergence/app/DeleteContactEmergence';

describe('SaveContactEmergence UseCase', () => {
  let repository: InMemoryContactEmergenceRepository;
  let useCase: SaveContactEmergence;

  const USER_ID = '11111111-1111-4111-8111-111111111111';

  beforeEach(() => {
    repository = new InMemoryContactEmergenceRepository();
    useCase = new SaveContactEmergence(repository, new GenerateUUID());
  });

  test('guarda un contacto válido', async () => {
    const result = await useCase.run({
      userId: USER_ID,
      name: 'Mamá',
      parentesco: 'madre',
      telefono: '+57 300 000 0000',
    });

    expect(result.isValid).toBe(true);
    expect(result.getValue().parentesco.value).toBe('madre');
    expect(repository.items).toHaveLength(1);
  });

  test('rechaza un nombre demasiado corto', async () => {
    const result = await useCase.run({
      userId: USER_ID,
      name: 'Ma',
      parentesco: 'madre',
    });
    expect(result.isValid).toBe(false);
  });

  test('rechaza un parentesco inválido', async () => {
    const result = await useCase.run({
      userId: USER_ID,
      name: 'Mamá',
      parentesco: 'primo',
    });
    expect(result.isValid).toBe(false);
  });

  test('guarda sin teléfono (opcional)', async () => {
    const result = await useCase.run({
      userId: USER_ID,
      name: 'Papá',
      parentesco: 'padre',
    });
    expect(result.isValid).toBe(true);
    expect(result.getValue().telefono).toBeUndefined();
  });
});

describe('GetAllContactsByUserId UseCase', () => {
  let repository: InMemoryContactEmergenceRepository;
  let useCase: GetAllContactsByUserId;

  const USER_ID = '11111111-1111-4111-8111-111111111111';
  const OTHER_USER = '22222222-2222-4222-8222-222222222222';

  beforeEach(() => {
    repository = new InMemoryContactEmergenceRepository();
    useCase = new GetAllContactsByUserId(repository);
  });

  test('retorna solo los contactos del usuario', async () => {
    repository.items.push(
      ContactEmergenceFactory.createInstance({ userId: USER_ID }),
      ContactEmergenceFactory.createInstance({ userId: OTHER_USER }),
    );

    const result = await useCase.run({ userId: USER_ID });

    expect(result.isValid).toBe(true);
    expect(result.getValue()).toHaveLength(1);
  });

  test('rechaza un userId inválido', async () => {
    const result = await useCase.run({ userId: '' });
    expect(result.isValid).toBe(false);
  });
});

describe('GetOneContactById UseCase', () => {
  let repository: InMemoryContactEmergenceRepository;
  let useCase: GetOneContactById;

  beforeEach(() => {
    repository = new InMemoryContactEmergenceRepository();
    useCase = new GetOneContactById(repository);
  });

  test('retorna el contacto cuando existe', async () => {
    const contact = ContactEmergenceFactory.createInstance();
    repository.items.push(contact);

    const result = await useCase.run({ id: contact.id.value });
    expect(result.isValid).toBe(true);
    expect(result.getValue().id.value).toBe(contact.id.value);
  });

  test('falla cuando el contacto no existe', async () => {
    const result = await useCase.run({ id: 'no-existe' });
    expect(result.isValid).toBe(false);
  });
});

describe('UpdateContactEmergence UseCase', () => {
  let repository: InMemoryContactEmergenceRepository;
  let useCase: UpdateContactEmergence;

  beforeEach(() => {
    repository = new InMemoryContactEmergenceRepository();
    useCase = new UpdateContactEmergence(repository);
  });

  test('actualiza el nombre y el teléfono', async () => {
    const contact = ContactEmergenceFactory.createInstance();
    repository.items.push(contact);

    const result = await useCase.run(contact.id.value, {
      name: 'Nuevo Nombre',
      telefono: '+57 311 111 1111',
    });

    expect(result.isValid).toBe(true);
    expect(result.getValue().name.value).toBe('Nuevo Nombre');
    expect(result.getValue().telefono).toBe('+57 311 111 1111');
  });

  test('falla cuando el contacto no existe', async () => {
    const result = await useCase.run('no-existe', { name: 'Alguien' });
    expect(result.isValid).toBe(false);
  });
});

describe('DeleteContactEmergence UseCase', () => {
  let repository: InMemoryContactEmergenceRepository;
  let useCase: DeleteContactEmergence;

  beforeEach(() => {
    repository = new InMemoryContactEmergenceRepository();
    useCase = new DeleteContactEmergence(repository);
  });

  test('elimina el contacto', async () => {
    const contact = ContactEmergenceFactory.createInstance();
    repository.items.push(contact);

    const result = await useCase.run({ id: contact.id.value });

    expect(result.isValid).toBe(true);
    expect(repository.items).toHaveLength(0);
  });

  test('falla cuando el contacto no existe', async () => {
    const result = await useCase.run({ id: 'no-existe' });
    expect(result.isValid).toBe(false);
  });
});
