import {
  Controller,
  Post,
  Body,
  Inject,
  Get,
  UseGuards,
  Request,
} from '@nestjs/common';
import { SavePreference } from '../../app/SavePreference';
import { GetOneByIdPreference } from '../../app/GetOneByUserIdPreference';
import { SavePreferenceDTO } from './DTOs/save-preference.dto';
import { AuthGuard } from '../../../auth/infra/auth.guard';
import { TranslationService } from '../../../shared/infrastructure/i18n/translation.service';

@Controller('preference')
@UseGuards(AuthGuard) // <--- Protegemos TODO el controlador de una vez
export class PreferenceController {
  constructor(
    @Inject('GetOneByIdPreference')
    private readonly getOneByIdPreferenceUseCase: GetOneByIdPreference,
    @Inject('SavePreference')
    private readonly savePreferenceUseCase: SavePreference,
    private readonly translationService: TranslationService,
  ) { }

  /**
   * OBTERNER PREFERENCIAS DEL USUARIO ACTUAL
   * GET /preference
   */
  @Get()
  async getOneById(@Request() req: any) {
    const userId = req.user.sub; // Extraemos el ID del token de forma segura

    // Pasamos el ID envuelto en la estructura que espera tu caso de uso (FindUserIdDTO)
    const result = await this.getOneByIdPreferenceUseCase.run({ id: userId });

    if (!result.isValid) throw result.getError();

    const lang = this.translationService.resolveLanguage(req.headers['accept-language'] as string);
    return {
      message: this.translationService.translate('PREFERENCES_FETCHED', lang),
      data: result.getValue().toPlain(),
    };
  }

  @Post()
  async save(@Request() req: any, @Body() body: SavePreferenceDTO) {
    const userId = req.user.sub;

    const result = await this.savePreferenceUseCase.run(
      userId,
      body.profileImg,
      body.unitMeasure,
      body.thresholds,
      body.insulinRatios,
      body.sensitivity,
    );

    if (!result.isValid) throw result.getError();

    const lang = this.translationService.resolveLanguage(req.headers['accept-language'] as string);
    return {
      message: this.translationService.translate('PREFERENCES_SAVED', lang),
      data: result.getValue().toPlain(),
    };
  }
}