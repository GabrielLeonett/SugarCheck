import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  HttpException,
  HttpStatus,
  Inject,
  BadRequestException,
  NotFoundException,
  HttpCode,
} from '@nestjs/common';
import { CreateImc } from '../../app/CreateImc';
import { GetAllImcByUserId } from '../../app/GetAllImcByUserId';
import { GetOneImcById } from '../../app/GetOneImcById';
import { UpdateImc } from '../../app/UpdateImc';
import { DeleteImc } from '../../app/DeleteImc';
import { AuthGuard } from '../../../auth/infra/auth.guard';
import { CreateImcDTO } from './DTOs/create-imc.dto';
import { UpdateImcDTO } from './DTOs/update-imc.dto';
import { ImcNotFoundError } from '../../core/errors/ImcNotFoundError';
import { ErrorAbstract } from '../../../shared/error-abstract';

@Controller('imc')
@UseGuards(AuthGuard)
export class ImcController {
  constructor(
    @Inject('CreateImc')
    private readonly createImc: CreateImc,
    @Inject('GetAllImcByUserId')
    private readonly getAllImcByUserId: GetAllImcByUserId,
    @Inject('GetOneImcById')
    private readonly getOneImcById: GetOneImcById,
    @Inject('UpdateImc')
    private readonly updateImc: UpdateImc,
    @Inject('DeleteImc')
    private readonly deleteImc: DeleteImc,
  ) {}

  @Get()
  async getAll(@Request() req: any) {
    const userId = req.user.sub;
    const result = await this.getAllImcByUserId.run({ userId });
    if (!result.isValid) {
      throw new HttpException(result.getError().message, HttpStatus.BAD_REQUEST);
    }
    return result.getValue().map((r) => r.toPlain());
  }

  @Get(':id')
  async getOneById(@Param('id') id: string) {
    const result = await this.getOneImcById.run({ id });
    if (!result.isValid) {
      const error = result.getError();
      if (error instanceof ImcNotFoundError) throw new NotFoundException(error.message);
      if (error instanceof ErrorAbstract) throw new BadRequestException(error.message);
      throw error;
    }
    return result.getValue().toPlain();
  }

  @Post()
  async create(@Request() req: any, @Body() body: CreateImcDTO) {
    const userId = req.user.sub;
    const result = await this.createImc.run({
      userId,
      peso: body.peso,
      altura: body.altura,
      dia: body.dia,
      mes: body.mes,
      anio: body.anio,
    });
    if (!result.isValid) {
      throw new HttpException(result.getError().message, HttpStatus.BAD_REQUEST);
    }
    return result.getValue().toPlain();
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: UpdateImcDTO) {
    const result = await this.updateImc.run(id, body);
    if (!result.isValid) {
      const error = result.getError();
      if (error instanceof ImcNotFoundError) throw new NotFoundException(error.message);
      if (error instanceof ErrorAbstract) throw new BadRequestException(error.message);
      throw error;
    }
    return result.getValue().toPlain();
  }

  @Delete(':id')
  @HttpCode(204)
  async delete(@Param('id') id: string) {
    const result = await this.deleteImc.run({ id });
    if (!result.isValid) {
      const error = result.getError();
      if (error instanceof ImcNotFoundError) throw new NotFoundException(error.message);
      if (error instanceof ErrorAbstract) throw new BadRequestException(error.message);
      throw error;
    }
    return;
  }
}
