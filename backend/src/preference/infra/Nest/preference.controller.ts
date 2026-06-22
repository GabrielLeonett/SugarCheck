import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  Inject,
  Get,
  UseGuards,
  Request,
} from '@nestjs/common';
import { SavePreference } from '../../app/SavePreference';
import { GetOneByIdPreference } from '../../app/GetOneByUserIdPreference';
import { SavePreferenceDTO } from './DTOs/save-preference.dto';
import { AuthGuard } from '../../../auth/infra/auth.guard';

@Controller('preference')
@UseGuards(AuthGuard) // <--- Protegemos TODO el controlador de una vez
export class PreferenceController {
  constructor(
    @Inject('GetOneByIdPreference')
    private readonly getOneByIdPreferenceUseCase: GetOneByIdPreference,
    @Inject('SavePreference')
    private readonly savePreferenceUseCase: SavePreference,
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

    if (!result.isValid) {
      throw new HttpException(
        result.getError().message,
        HttpStatus.NOT_FOUND,
      );
    }

    return {
      message: 'Preferencias obtenidas exitosamente',
      data: result.getValue().toPlain(),
    };
  }

  /**
   * CREAR PREFERENCIAS DEL USUARIO ACTUAL
   * POST /preference
   */
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
      body.locale,
      body.theme
    );

    if (!result.isValid) {
      throw new HttpException(
        result.getError().message,
        HttpStatus.BAD_REQUEST,
      );
    }

    return {
      message: 'Preferencias guardadas exitosamente',
      data: result.getValue().toPlain(),
    };
  }
}