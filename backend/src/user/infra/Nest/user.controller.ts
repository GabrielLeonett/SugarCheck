import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  NotFoundException,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { GetAllUser } from '../../app/GetAllUser';
import { DeleteUser } from '../../app/DeleteUser';
import { GetOneByIdUser } from '../../app/GetOneByIdUser';
import { GetOneByEmailUser } from '../../app/GetOneByEmailUser';
import { GetOneByUsernameUser } from '../../app/GetOneByUsernameUser';
import { SaveUser } from '../../app/SaveUser';
import { UpdateUser } from '../../app/UpdateUser';
import { UpdateUserEmail } from '../../app/UpdateUserEmail';
import { UserAlreadyExists } from '../../core/errors/UserAlreadyExists';
import { ErrorAbstract } from '../../../shared/error-abstract';
import { UserNotFoundError } from '../../core/errors/UserNotFoundError';
import { FindUserIdDTO } from '../../../shared/infrastructure/DTOs/find-user-id.dto';
import { FindUserEmailDTO } from './DTOs/find-user-email.dto';
import { CreateUserDTO } from './DTOs/create-user.dto';
import { UpdateUserDto } from './DTOs/update-user.dto';
import { UpdateEmailDTO } from './DTOs/update-email.dto';
import { AuthGuard } from '../../../auth/infra/auth.guard';
import { RolesGuard } from '../../../auth/infra/roles.guard';
import { Roles } from '../../../auth/infra/roles.decorator';
import { Role } from '../../../shared/enums/role.enum';

@Controller('user')
export class UserController {
  constructor(
    @Inject('GetAllUser') private readonly getAllUser: GetAllUser,
    @Inject('DeleteUser') private readonly deleteUser: DeleteUser,
    @Inject('GetOneByIdUser') private readonly getOneByIdUser: GetOneByIdUser,
    @Inject('UpdateUser') private readonly updateUser: UpdateUser,
    @Inject('GetOneByEmailUser') private readonly getOneByEmailUser: GetOneByEmailUser,
    @Inject('GetOneByUsernameUser') private readonly getOneByUsernameUser: GetOneByUsernameUser,
    @Inject('SaveUser') private readonly saveUser: SaveUser,
    @Inject('UpdateUserEmail') private readonly updateUserEmail: UpdateUserEmail,
  ) {}

  @Get()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.Admin)
  async getAll() {
    const result = await this.getAllUser.run();
    if (!result.isValid) throw result.getError();

    return result.getValue().map((user) => user.toPlain());
  }

  @Get('/id/:id')
  async getOneById(@Param() params: FindUserIdDTO) {
    const result = await this.getOneByIdUser.run(params);

    if (!result.isValid) {
      const error = result.getError();
      if (error instanceof UserNotFoundError) throw new NotFoundException(error.message);
      if (error instanceof ErrorAbstract) throw new BadRequestException(error.message);
      throw error;
    }

    return result.getValue().toPlain();
  }

  @Get('/email/:email')
  async getOneByEmail(@Param() params: FindUserEmailDTO) {
    const result = await this.getOneByEmailUser.run(params);

    if (!result.isValid) {
      const error = result.getError();
      if (error instanceof UserNotFoundError) throw new NotFoundException(error.message);
      if (error instanceof ErrorAbstract) throw new BadRequestException(error.message);
      throw error;
    }

    const user = result.getValue();
    if (!user) return [];
    return user.toPlain();
  }

  @Get('/username/:username')
  async getOneByUsername(@Param('username') username: string) {
    const result = await this.getOneByUsernameUser.run({ username });

    if (!result.isValid) {
      const error = result.getError();
      if (error instanceof UserNotFoundError) throw new NotFoundException(error.message);
      if (error instanceof ErrorAbstract) throw new BadRequestException(error.message);
      throw error;
    }

    return result.getValue().toPlain();
  }

  @Post('register')
  async register(@Body() create: CreateUserDTO) {
    const result = await this.saveUser.run({
      name: create.name,
      username: create.username,
      email: create.email,
      roles: [Role.Guerrero],
      sexo: create.sexo,
      fechaNacimiento: create.fechaNacimiento,
      password: create.password,
    });

    if (!result.isValid) {
      const error = result.getError();
      if (error instanceof UserAlreadyExists) throw new ConflictException(error.message);
      if (error instanceof ErrorAbstract) throw new BadRequestException(error.message);
      throw error;
    }

    return result.getValue().toPlain();
  }

  @Post('admin')
  @Roles(Role.Admin)
  @UseGuards(AuthGuard, RolesGuard)
  async createAdmin(@Body() create: CreateUserDTO) {
    const result = await this.saveUser.run({
      name: create.name,
      username: create.username,
      email: create.email,
      roles: [Role.Admin],
      sexo: create.sexo,
      fechaNacimiento: create.fechaNacimiento,
      password: create.password,
    });

    if (!result.isValid) {
      const error = result.getError();
      if (error instanceof UserAlreadyExists) throw new ConflictException(error.message);
      if (error instanceof ErrorAbstract) throw new BadRequestException(error.message);
      throw error;
    }

    return result.getValue().toPlain();
  }

  @Patch(':id')
  @UseGuards(AuthGuard, RolesGuard)
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateUserDto,
  ) {
    const result = await this.updateUser.run(id, updateDto);

    if (!result.isValid) {
      const error = result.getError();
      if (error instanceof UserAlreadyExists) throw new ConflictException(error.message);
      if (error instanceof ErrorAbstract) throw new BadRequestException(error.message);
      throw error;
    }

    return result.getValue().toPlain();
  }

  @Patch('/email')
  @UseGuards(AuthGuard)
  async updateEmail(
    @Body() body: UpdateEmailDTO,
    @Request() req: any,
  ) {
    const userId = req.user.sub;
    const result = await this.updateUserEmail.run({ id: userId, email: body.email });

    if (!result.isValid) {
      const error = result.getError();
      if (error instanceof UserAlreadyExists) throw new ConflictException(error.message);
      if (error instanceof ErrorAbstract) throw new BadRequestException(error.message);
      throw error;
    }

    return { message: 'Correo electrónico actualizado correctamente' };
  }

  @Delete(':id')
  @HttpCode(204)
  @UseGuards(AuthGuard, RolesGuard)
  async delete(@Param() param: FindUserIdDTO) {
    const result = await this.deleteUser.run(param);

    if (!result.isValid) {
      const error = result.getError();
      if (error instanceof UserNotFoundError) throw new NotFoundException(error.message);
      if (error instanceof ErrorAbstract) throw new BadRequestException(error.message);
      throw error;
    }

    return;
  }
}
