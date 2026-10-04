import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  Request,
  Inject,
  BadRequestException,
  NotFoundException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CreateGlucose } from '../../app/CreateGlucose';
import { GetAllGlucose } from '../../app/GetAllGlucose';
import { UpdateGlucose } from '../../app/UpdateGlucose';
import { AuthGuard } from '../../../auth/infra/auth.guard';
import { CreateGlucoseDTO } from './DTOs/create-glucose.dto';
import { UpdateGlucoseDTO } from './DTOs/update-glucose.dto';
import { GlucoseNotFoundError } from '../../core/errors/GlucoseNotFoundError';
import { EditWindowExpiredError } from '../../core/errors/EditWindowExpiredError';
import { ErrorAbstract } from '../../../shared/error-abstract';
import { TranslationService } from '../../../shared/infrastructure/i18n/translation.service';

@Controller('glucose')
@UseGuards(AuthGuard)
export class GlucoseController {
  constructor(
    @Inject('CreateGlucose')
    private readonly createGlucose: CreateGlucose,
    @Inject('GetAllGlucose')
    private readonly getAllGlucose: GetAllGlucose,
    @Inject('UpdateGlucose')
    private readonly updateGlucose: UpdateGlucose,
    private readonly translationService: TranslationService,
  ) {}

  @Get()
  async getAll(@Request() req: any) {
    const userId = req.user.sub;
    const result = await this.getAllGlucose.run({ userId });
    if (!result.isValid) {
      throw new BadRequestException(result.getError().message);
    }
    return result.getValue().map((r) => r.toPlain());
  }

  @Post()
  async create(@Request() req: any, @Body() body: CreateGlucoseDTO) {
    const userId = req.user.sub;
    const result = await this.createGlucose.run({
      userId,
      valueMgdl: body.valueMgdl,
      mealTag: body.mealTag,
      date: body.date,
      time: body.time,
    });
    if (!result.isValid) {
      throw new BadRequestException(result.getError().message);
    }
    return result.getValue().toPlain();
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: UpdateGlucoseDTO) {
    const result = await this.updateGlucose.run(id, body);
    if (!result.isValid) {
      const error = result.getError();
      if (error instanceof GlucoseNotFoundError) throw new NotFoundException(error.message);
      if (error instanceof EditWindowExpiredError) throw new BadRequestException(error.message);
      if (error instanceof ErrorAbstract) throw new BadRequestException(error.message);
      throw error;
    }
    return result.getValue().toPlain();
  }
}
