import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  Param,
  Post,
} from '@nestjs/common';
import type { CreateUserDTO } from './dto/create-user.dto';
import { GetAllUser } from '../../application/GetAllUser';
import { DeleteUser } from '../../application/DeleteUser';
import { GetOneByIdUser } from '../../application/GetOneByIdUser';
import { GetOneByEmailUser } from '../../application/GetOneByEmailUser';
import { SaveUser } from '../../application/SaveUser';

@Controller('user')
export class UserController {
  constructor(
    @Inject('GetAllUser') private readonly getAllUser: GetAllUser,
    @Inject('DeleteUser') private readonly deleteUser: DeleteUser,
    @Inject('GetOneByIdUser') private readonly getOneByIdUser: GetOneByIdUser,
    @Inject('GetOneByEmailUser')
    private readonly getOneByEmailUser: GetOneByEmailUser,
    @Inject('SaveUser') private readonly saveUser: SaveUser,
  ) {}

  @Get()
  async getAll() {
    const result = await this.getAllUser.run();
    if (!result.isValid) throw result.getError();

    return result.getValue().map((user) => user.toPlain());
  }

  // Diferenciamos las rutas para evitar colisiones
  @Get('id/:id')
  async getOneById(@Param('id') id: string) {
    const result = await this.getOneByIdUser.run(id);
    if (!result.isValid) throw result.getError();

    const user = result.getValue();
    if (!user) return [];
    return user.toPlain();
  }

  @Get('email/:email')
  async getOneByEmail(@Param('email') email: string) {
    const result = await this.getOneByEmailUser.run(email);
    if (!result.isValid) throw result.getError();

    const user = result.getValue();
    if (!user) return [];
    return user.toPlain();
  }

  @Post()
  async save(@Body() create: CreateUserDTO) {
    // Pasamos el objeto completo, más limpio y escalable
    const result = await this.saveUser.run(
      create.name,
      create.email,
      create.roles,
      create.fecha_nacimiento,
      create.password,
    );
    if (!result.isValid) throw result.getError();

    return result.getValue().toPlain();
  }

  @Delete(':id')
  @HttpCode(204) // Estándar para borrado exitoso sin contenido
  async delete(@Param('id') id: string) {
    const result = await this.deleteUser.run(id);
    if (!result.isValid) throw result.getError();

    return; // No devolvemos nada
  }
}
