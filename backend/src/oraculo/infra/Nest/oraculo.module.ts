import { forwardRef, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../shared/infrastructure/prisma.service';
import { GenerateUUID } from '../../../shared/infrastructure/generate-uuid';
import { AuthModule } from '../../../auth/infra/auth.module';
import { ConversationController } from './conversation.controller';
import { PrismaConversationRepository } from '../persistence/PrismaConversationRepository';
import { PrismaGlucoseDataProvider } from '../glucose/PrismaGlucoseDataProvider';
import { GeminiLanguageModel } from '../language-model/GeminiLanguageModel';
import { LocalLanguageModel } from '../language-model/LocalLanguageModel';
import { ConversationRepository } from '../../core/conversation/ConversationRepository';
import { MedicalSafetyPolicy } from '../../core/services/MedicalSafetyPolicy';
import { StartConversation } from '../../app/conversation/StartConversation';
import { SendMessage } from '../../app/conversation/SendMessage';
import { GetConversationHistory } from '../../app/conversation/GetConversationHistory';
import { GetUserConversations } from '../../app/conversation/GetUserConversations';
import { DeleteConversation } from '../../app/conversation/DeleteConversation';
import { LanguageModel } from '../../app/ports/LanguageModel';
import { GlucoseDataProvider } from '../../app/ports/GlucoseDataProvider';

@Module({
  imports: [forwardRef(() => AuthModule)],
  providers: [
    PrismaService,
    MedicalSafetyPolicy,
    {
      provide: 'ConversationRepository',
      useClass: PrismaConversationRepository,
    },
    {
      provide: 'GlucoseDataProvider',
      useClass: PrismaGlucoseDataProvider,
    },
    {
      provide: 'GenerateUUID',
      useClass: GenerateUUID,
    },
    {
      provide: 'LanguageModel',
      inject: [ConfigService],
      useFactory: (config: ConfigService): LanguageModel => {
        const apiKey = config.get<string>('GEMINI_API_KEY');
        if (apiKey) {
          const model = config.get<string>('GEMINI_MODEL') ?? 'gemini-2.0-flash';
          return new GeminiLanguageModel(apiKey, model);
        }
        return new LocalLanguageModel();
      },
    },
    {
      provide: 'StartConversation',
      useFactory: (repo: ConversationRepository, generate: GenerateUUID) =>
        new StartConversation(repo, generate),
      inject: ['ConversationRepository', 'GenerateUUID'],
    },
    {
      provide: 'SendMessage',
      useFactory: (
        repo: ConversationRepository,
        generate: GenerateUUID,
        languageModel: LanguageModel,
        glucoseDataProvider: GlucoseDataProvider,
        safetyPolicy: MedicalSafetyPolicy,
      ) => new SendMessage(repo, generate, languageModel, glucoseDataProvider, safetyPolicy),
      inject: ['ConversationRepository', 'GenerateUUID', 'LanguageModel', 'GlucoseDataProvider', MedicalSafetyPolicy],
    },
    {
      provide: 'GetConversationHistory',
      useFactory: (repo: ConversationRepository) => new GetConversationHistory(repo),
      inject: ['ConversationRepository'],
    },
    {
      provide: 'GetUserConversations',
      useFactory: (repo: ConversationRepository) => new GetUserConversations(repo),
      inject: ['ConversationRepository'],
    },
    {
      provide: 'DeleteConversation',
      useFactory: (repo: ConversationRepository) => new DeleteConversation(repo),
      inject: ['ConversationRepository'],
    },
  ],
  controllers: [ConversationController],
})
export class OraculoModule {}
