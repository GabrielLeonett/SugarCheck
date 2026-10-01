import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.test' });

import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from '../../../src/shared/infrastructure/prisma.service';
import { PrismaContactEmergenceRepository } from '../../../src/contact_emergence/infra/PrismaContactEmergenceRepository/PrismaContactEmergenceRepository';
import { ContactEmergenceFactory } from '../fixtures/contact-emergence.fixture';
import { ContactName } from '../../../src/contact_emergence/core/value-objects/ContactName';
import {
  createTestUser,
  deleteTestUser,
  TestUser,
} from '../../shared/helpers/test-db.helper';

describe('PrismaContactEmergenceRepository (Integration)', () => {
  let prismaService: PrismaService;
  let repository: PrismaContactEmergenceRepository;
  let user: TestUser;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ envFilePath: '.env.test', isGlobal: true }),
      ],
      providers: [PrismaService],
    }).compile();

    prismaService = module.get<PrismaService>(PrismaService);
    await prismaService.onModuleInit();
    repository = new PrismaContactEmergenceRepository(prismaService);
    user = await createTestUser(prismaService as any);
  });

  afterAll(async () => {
    await deleteTestUser(prismaService as any, user.id);
    await prismaService.onModuleDestroy();
  });

  it('save + getOneById retorna el contacto guardado', async () => {
    const contact = ContactEmergenceFactory.createInstance({ userId: user.id });

    const saved = await repository.save(contact);
    expect(saved.isValid).toBe(true);

    const found = await repository.getOneById(contact.id);
    expect(found.isValid).toBe(true);
    expect(found.getValue().name.value).toBe(contact.name.value);
  });

  it('getAllByUserId retorna solo los contactos del usuario', async () => {
    const contact = ContactEmergenceFactory.createInstance({ userId: user.id });
    await repository.save(contact);

    const result = await repository.getAllByUserId(contact.userId);
    expect(result.isValid).toBe(true);
    result.getValue().forEach((c) => expect(c.userId.value).toBe(user.id));
  });

  it('update cambia el nombre y el teléfono', async () => {
    const contact = ContactEmergenceFactory.createInstance({ userId: user.id });
    await repository.save(contact);

    const updated = await repository.update(contact.id, {
      name: ContactName.create('Nombre Editado').getValue(),
      telefono: '+57 311 111 1111',
    });

    expect(updated.isValid).toBe(true);
    expect(updated.getValue().name.value).toBe('Nombre Editado');
    expect(updated.getValue().telefono).toBe('+57 311 111 1111');
  });

  it('delete hace soft-delete y la fila persiste con deletedAt', async () => {
    const contact = ContactEmergenceFactory.createInstance({ userId: user.id });
    await repository.save(contact);

    await repository.delete(contact.id);

    const found = await repository.getOneById(contact.id);
    expect(found.isValid).toBe(false);

    const row = await (prismaService as any).contactEmergence.findUnique({
      where: { id: contact.id.value },
    });
    expect(row.deletedAt).not.toBeNull();
  });
});
