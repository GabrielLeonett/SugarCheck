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
import { SaveContactEmergence } from '../../app/SaveContactEmergence';
import { GetAllContactsByUserId } from '../../app/GetAllContactsByUserId';
import { GetOneContactById } from '../../app/GetOneContactById';
import { UpdateContactEmergence } from '../../app/UpdateContactEmergence';
import { DeleteContactEmergence } from '../../app/DeleteContactEmergence';
import { AuthGuard } from '../../../auth/infra/auth.guard';
import { CreateContactEmergenceDTO } from './DTOs/create-contact-emergence.dto';
import { UpdateContactEmergenceDTO } from './DTOs/update-contact-emergence.dto';
import { ContactNotFoundError } from '../../core/errors/ContactNotFoundError';
import { ErrorAbstract } from '../../../shared/error-abstract';

@Controller('contact-emergence')
@UseGuards(AuthGuard)
export class ContactEmergenceController {
  constructor(
    @Inject('SaveContactEmergence')
    private readonly saveContactEmergence: SaveContactEmergence,
    @Inject('GetAllContactsByUserId')
    private readonly getAllContactsByUserId: GetAllContactsByUserId,
    @Inject('GetOneContactById')
    private readonly getOneContactById: GetOneContactById,
    @Inject('UpdateContactEmergence')
    private readonly updateContactEmergence: UpdateContactEmergence,
    @Inject('DeleteContactEmergence')
    private readonly deleteContactEmergence: DeleteContactEmergence,
  ) {}

  @Get()
  async getAll(@Request() req: any) {
    const userId = req.user.sub;
    const result = await this.getAllContactsByUserId.run({ userId });
    if (!result.isValid) {
      throw new HttpException(result.getError().message, HttpStatus.BAD_REQUEST);
    }
    return result.getValue().map((c) => c.toPlain());
  }

  @Get(':id')
  async getOneById(@Param('id') id: string) {
    const result = await this.getOneContactById.run({ id });
    if (!result.isValid) {
      const error = result.getError();
      if (error instanceof ContactNotFoundError) throw new NotFoundException(error.message);
      if (error instanceof ErrorAbstract) throw new BadRequestException(error.message);
      throw error;
    }
    return result.getValue().toPlain();
  }

  @Post()
  async create(@Request() req: any, @Body() body: CreateContactEmergenceDTO) {
    const userId = req.user.sub;
    const result = await this.saveContactEmergence.run({
      userId,
      name: body.name,
      parentesco: body.parentesco,
      telefono: body.telefono,
    });
    if (!result.isValid) {
      throw new HttpException(result.getError().message, HttpStatus.BAD_REQUEST);
    }
    return result.getValue().toPlain();
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: UpdateContactEmergenceDTO) {
    const result = await this.updateContactEmergence.run(id, body);
    if (!result.isValid) {
      const error = result.getError();
      if (error instanceof ContactNotFoundError) throw new NotFoundException(error.message);
      if (error instanceof ErrorAbstract) throw new BadRequestException(error.message);
      throw error;
    }
    return result.getValue().toPlain();
  }

  @Delete(':id')
  @HttpCode(204)
  async delete(@Param('id') id: string) {
    const result = await this.deleteContactEmergence.run({ id });
    if (!result.isValid) {
      const error = result.getError();
      if (error instanceof ContactNotFoundError) throw new NotFoundException(error.message);
      if (error instanceof ErrorAbstract) throw new BadRequestException(error.message);
      throw error;
    }
    return;
  }
}
