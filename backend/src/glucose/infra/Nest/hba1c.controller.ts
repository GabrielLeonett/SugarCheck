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
} from '@nestjs/common';
import { CreateHbA1c } from '../../app/CreateHbA1c';
import { GetAllHbA1c } from '../../app/GetAllHbA1c';
import { UpdateHbA1c } from '../../app/UpdateHbA1c';
import { AuthGuard } from '../../../auth/infra/auth.guard';
import { CreateHbA1cDTO } from './DTOs/create-hba1c.dto';
import { UpdateHbA1cDTO } from './DTOs/update-hba1c.dto';
import { HbA1cNotFoundError } from '../../core/errors/HbA1cNotFoundError';
import { EditWindowExpiredError } from '../../core/errors/EditWindowExpiredError';
import { ErrorAbstract } from '../../../shared/error-abstract';
import { TranslationService } from '../../../shared/infrastructure/i18n/translation.service';

@Controller('hba1c')
@UseGuards(AuthGuard)
export class HbA1cController {
  constructor(
    @Inject('CreateHbA1c')
    private readonly createHbA1c: CreateHbA1c,
    @Inject('GetAllHbA1c')
    private readonly getAllHbA1c: GetAllHbA1c,
    @Inject('UpdateHbA1c')
    private readonly updateHbA1c: UpdateHbA1c,
    private readonly translationService: TranslationService,
  ) {}

  @Get()
  async getAll(@Request() req: any) {
    const userId = req.user.sub;
    const result = await this.getAllHbA1c.run({ userId });
    if (!result.isValid) {
      throw new BadRequestException(result.getError().message);
    }
    return result.getValue().map((r) => r.toPlain());
  }

  @Post()
  async create(@Request() req: any, @Body() body: CreateHbA1cDTO) {
    const userId = req.user.sub;
    const result = await this.createHbA1c.run({
      userId,
      valuePercent: body.valuePercent,
      examDate: body.examDate,
    });
    if (!result.isValid) {
      throw new BadRequestException(result.getError().message);
    }
    return result.getValue().toPlain();
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: UpdateHbA1cDTO) {
    const result = await this.updateHbA1c.run(id, body);
    if (!result.isValid) {
      const error = result.getError();
      if (error instanceof HbA1cNotFoundError) throw new NotFoundException(error.message);
      if (error instanceof EditWindowExpiredError) throw new BadRequestException(error.message);
      if (error instanceof ErrorAbstract) throw new BadRequestException(error.message);
      throw error;
    }
    return result.getValue().toPlain();
  }
}
