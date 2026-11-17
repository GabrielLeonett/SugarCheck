import { forwardRef, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../shared/infrastructure/prisma.service';
import { GenerateUUID } from '../../../shared/infrastructure/generate-uuid';
import { AuthModule } from '../../../auth/infra/auth.module';
import { ConversationController } from './conversation.controller';
import { PrismaConversationRepository } from '../persistence/PrismaConversationRepository';
import { PrismaGlucoseDataProvider } from '../glucose/PrismaGlucoseDataProvider';
import { FallbackLanguageModel } from '../language-model/FallbackLanguageModel';
import { DeepSeekLanguageModel } from '../language-model/DeepSeekLanguageModel';
import { GeminiLanguageModel } from '../language-model/GeminiLanguageModel';
import { LocalLanguageModel } from '../language-model/LocalLanguageModel';
import { ConversationRepository } from '../../core/conversation/ConversationRepository';
import { MedicalSafetyPolicy } from '../../core/services/MedicalSafetyPolicy';
import { StartConversation } from '../../app/conversation/StartConversation';
import { SendMessage } from '../../app/conversation/SendMessage';
import { StreamMessage } from '../../app/conversation/StreamMessage';
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
        const local = new LocalLanguageModel();

        const deepSeekKey = config.get<string>('DEEPSEEK_API_KEY')?.trim();
        if (deepSeekKey) {
          const model = config.get<string>('DEEPSEEK_MODEL')?.trim() || 'deepseek-flash';
          return new FallbackLanguageModel(new DeepSeekLanguageModel(deepSeekKey, model), local);
        }

        // Gemini se conserva como alternativa para despliegues que aún no
        // migraron sus credenciales a DeepSeek.
        const geminiKey = config.get<string>('GEMINI_API_KEY')?.trim();
        if (geminiKey) {
          const model = config.get<string>('GEMINI_MODEL')?.trim() || 'gemini-3.1-flash-lite';
          return new FallbackLanguageModel(new GeminiLanguageModel(geminiKey, model), local);
        }

        return local;
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
      provide: 'StreamMessage',
      useFactory: (
        repo: ConversationRepository,
        generate: GenerateUUID,
        languageModel: LanguageModel,
        glucoseDataProvider: GlucoseDataProvider,
        safetyPolicy: MedicalSafetyPolicy,
      ) => new StreamMessage(repo, generate, languageModel, glucoseDataProvider, safetyPolicy),
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
