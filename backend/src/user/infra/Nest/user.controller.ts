import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
} from '@nestjs/common';
import { DeleteUser } from 'src/user/application/DeleteUser';
import { GetAllUser } from 'src/user/application/GetAllUser';
import { GetOneByEmailUser } from 'src/user/application/GetOneByEmailUser';
import { GetOneByIdUser } from 'src/user/application/GetOneByIdUser';
import { SaveUser } from 'src/user/application/SaveUser';
import type { CreateUserDTO } from './UserDTO';

@Controller('user')
export class UserController {
  constructor(
    private readonly getAllUser: GetAllUser,
    private readonly deleteUser: DeleteUser,
    private readonly getOneByIdUser: GetOneByIdUser,
    private readonly getOneByEmailUser: GetOneByEmailUser,
    private readonly saveUser: SaveUser,
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
      create.id,
      create.name,
      create.email,
      create.roles,
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
