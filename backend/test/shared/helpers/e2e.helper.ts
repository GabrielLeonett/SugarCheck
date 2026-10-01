import { INestApplication, ValidationPipe } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import cookieParser from 'cookie-parser';

export async function initE2EApp(
  moduleRef: TestingModule,
): Promise<INestApplication> {
  const app = moduleRef.createNestApplication();
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  await app.init();
  return app;
}

// Stub del TranslationService (los mensajes i18n no son parte del contrato que probamos)
export function stubTranslationService() {
  return {
    translate: (key: string) => key,
    resolveLanguage: () => 'es',
  };
}
