import { User } from '../core/User';
import { UserRepository } from '../core/UserRepository';
import { UserId } from '../core/UserId';
import { UserName } from '../core/UserName';
import { UserEmail } from '../core/UserEmail';
import { UserRoles } from '../core/UserRoles';
import { UserCreatedAt } from '../core/UserCreatedAt';
import { Result } from 'src/shared/result';
import { ErrorAbstract } from 'src/shared/error-abstract';

export class SaveUser {
  constructor(private readonly repository: UserRepository) {}

  public async run(
    id: string,
    name: string,
    email: string,
    role: string[],
  ): Promise<Result<User, ErrorAbstract>> {
    // 1. Validamos todos los Value Objects uno por uno
    const idRes = UserId.create(id);
    if (!idRes.isValid) return Result.fail(idRes.getError());

    const nameRes = UserName.create(name);
    if (!nameRes.isValid) return Result.fail(nameRes.getError());

    const emailRes = UserEmail.create(email);
    if (!emailRes.isValid) return Result.fail(emailRes.getError());

    const roleRes = UserRoles.create(role);
    if (!roleRes.isValid) return Result.fail(roleRes.getError());

    // La fecha de creación normalmente la generamos nosotros en el registro
    const dateRes = UserCreatedAt.create(new Date());
    if (!dateRes.isValid) return Result.fail(dateRes.getError());

    // 2. Si llegamos aquí, todos son válidos. Creamos la Entidad.
    const user = new User({
      id: idRes.getValue(),
      name: nameRes.getValue(),
      email: emailRes.getValue(),
      roles: roleRes.getValue(),
      createdAt: dateRes.getValue(),
    });

    // 3. Persistimos en la base de datos a través del repositorio
    return await this.repository.save(user);
  }
}
