import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpException,
  HttpStatus,
  Inject,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  HttpCode,
} from '@nestjs/common';
import { CreateInsulina } from '../../app/CreateInsulina';
import { GetAllInsulinas } from '../../app/GetAllInsulinas';
import { GetOneInsulina } from '../../app/GetOneInsulina';
import { UpdateInsulina } from '../../app/UpdateInsulina';
import { DeleteInsulina } from '../../app/DeleteInsulina';
import { GetTotalsInsulina } from '../../app/GetTotalsInsulina';
import { AuthGuard } from '../../../auth/infra/auth.guard';
import { CreateInsulinaDTO, UpdateInsulinaDTO, QueryInsulinaDTO } from './DTOs/insulina.dto';
import { InsulinaNotFoundError } from '../../core/errors/InsulinaNotFoundError';
import { InsulinaNoModificableError } from '../../core/errors/InsulinaNoModificableError';
import { InsulinaNoEliminableError } from '../../core/errors/InsulinaNoEliminableError';
import { ErrorAbstract } from '../../../shared/error-abstract';

@Controller('insulina')
@UseGuards(AuthGuard)
export class InsulinaController {
  constructor(
    @Inject('CreateInsulina')
    private readonly createInsulina: CreateInsulina,
    @Inject('GetAllInsulinas')
    private readonly getAllInsulinas: GetAllInsulinas,
    @Inject('GetOneInsulina')
    private readonly getOneInsulina: GetOneInsulina,
    @Inject('UpdateInsulina')
    private readonly updateInsulina: UpdateInsulina,
    @Inject('DeleteInsulina')
    private readonly deleteInsulina: DeleteInsulina,
    @Inject('GetTotalsInsulina')
    private readonly getTotalsInsulina: GetTotalsInsulina,
  ) {}

  @Get()
  async getAll(@Request() req: any, @Query() query: QueryInsulinaDTO) {
    const userId = req.user.sub;
    const result = await this.getAllInsulinas.run({
      userId,
      tipo: query.tipo,
      startDate: query.startDate,
      endDate: query.endDate,
    });
    if (!result.isValid) {
      throw new HttpException(result.getError().message, HttpStatus.BAD_REQUEST);
    }
    return result.getValue().map(r => r.toPlain());
  }

  @Get('totals')
  async getTotals(@Request() req: any) {
    const userId = req.user.sub;
    const result = await this.getTotalsInsulina.run({
      userId,
      date: new Date(),
    });
    if (!result.isValid) {
      throw new HttpException(result.getError().message, HttpStatus.BAD_REQUEST);
    }
    return result.getValue();
  }

  @Get(':id')
  async getOneById(@Param('id') id: string) {
    const result = await this.getOneInsulina.run({ id });
    if (!result.isValid) {
      const error = result.getError();
      if (error instanceof InsulinaNotFoundError) throw new NotFoundException(error.message);
      if (error instanceof ErrorAbstract) throw new BadRequestException(error.message);
      throw error;
    }
    return result.getValue().toPlain();
  }

  @Post()
  async create(@Request() req: any, @Body() body: CreateInsulinaDTO) {
    const userId = req.user.sub;
    const result = await this.createInsulina.run({
      userId,
      tipo: body.tipo,
      dosis: body.dosis,
      dia: body.dia,
      mes: body.mes,
      anio: body.anio,
      hora: body.hora,
      zona: body.zona,
      contexto: body.contexto,
    });
    if (!result.isValid) {
      throw new HttpException(result.getError().message, HttpStatus.BAD_REQUEST);
    }
    return result.getValue().toPlain();
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: UpdateInsulinaDTO) {
    const result = await this.updateInsulina.run({
      id,
      dosis: body.dosis,
      dia: body.dia,
      mes: body.mes,
      anio: body.anio,
      hora: body.hora,
      zona: body.zona,
      contexto: body.contexto,
    });
    if (!result.isValid) {
      const error = result.getError();
      if (error instanceof InsulinaNotFoundError) throw new NotFoundException(error.message);
      if (error instanceof InsulinaNoModificableError) throw new ForbiddenException(error.message);
      if (error instanceof ErrorAbstract) throw new BadRequestException(error.message);
      throw error;
    }
    return result.getValue().toPlain();
  }

  @Delete(':id')
  @HttpCode(403)
  async delete(@Param('id') id: string) {
    const result = await this.deleteInsulina.run({ id });
    if (!result.isValid) {
      const error = result.getError();
      if (error instanceof InsulinaNoEliminableError) throw new ForbiddenException(error.message);
      if (error instanceof ErrorAbstract) throw new BadRequestException(error.message);
      throw error;
    }
    return;
  }
}