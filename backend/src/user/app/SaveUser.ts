import { User } from '../core/User';
import { UserRepository } from '../core/UserRepository';
import { ErrorAbstract } from '../../shared/error-abstract';
import { Result } from '../../shared/result';
import { UserId } from '../../shared/core/value-objects/UserId';
import { UserUsername } from '../core/value-objects/UserUsername';
import { UserEmail } from '../core/value-objects/UserEmail';
import { UserRoles } from '../core/value-objects/UserRoles';
import { UserCreatedAt } from '../core/value-objects/UserCreatedAt';
import { UserFechaNacimiento } from '../core/value-objects/UserFechaNacimiento';
import { UserSexo } from '../core/value-objects/UserSexo';
import { UserName } from '../core/value-objects/UserName';
import { PasswordHasher } from '../../shared/application/ports/password-hasher.interface';
import { UserPassword } from '../core/value-objects/UserPassword';
import { GenerateUUIDInterface } from '../../shared/application/ports/generate-uuid.interface';
import { SavePreference } from '../../preference/app/SavePreference';

const BasePreference = {
  unitMeasure: "mg/dL",
  profileImg: "GlucoAstro",
  thresholds: {
    hypo: 90,
    hiper: 160
  },
  insulinRatios: {
    breakfast: 100,
    lunch: 100,
    dinner: 100
  },
  sensitivity: 1
};

export class SaveUser {
  constructor(
    private readonly repository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly generateUUID: GenerateUUIDInterface,
    private readonly savePreference: SavePreference,
  ) { }

  public async run(data: {
    name: string;
    username: string;
    email?: string;
    roles: string[];
    sexo: string;
    fechaNacimiento: Date;
    password: string;
  }): Promise<Result<User, ErrorAbstract>> {

    const id = await this.generateUUID.run();
    const idRes = UserId.create(id);
    if (!idRes.isValid) return Result.fail(idRes.getError());

    const nameRes = UserName.create(data.name);
    if (!nameRes.isValid) return Result.fail(nameRes.getError());

    const usernameRes = UserUsername.create(data.username);
    if (!usernameRes.isValid) return Result.fail(usernameRes.getError());

    const emailRes = UserEmail.create(data.email);
    if (!emailRes.isValid) return Result.fail(emailRes.getError());

    const roleRes = UserRoles.create(data.roles);
    if (!roleRes.isValid) return Result.fail(roleRes.getError());

    const sexoRes = UserSexo.create(data.sexo);
    if (!sexoRes.isValid) return Result.fail(sexoRes.getError());

    const dateRes = UserCreatedAt.create(new Date());
    if (!dateRes.isValid) return Result.fail(dateRes.getError());

    const FechaNacimientoRes = UserFechaNacimiento.create(data.fechaNacimiento);
    if (!FechaNacimientoRes.isValid) return Result.fail(FechaNacimientoRes.getError());

    const hashedPass = await this.passwordHasher.hash(data.password);
    const passwordRes = UserPassword.create(hashedPass);
    if (!passwordRes.isValid) return Result.fail(passwordRes.getError());

    const user = new User({
      id: idRes.getValue(),
      name: nameRes.getValue(),
      username: usernameRes.getValue(),
      email: emailRes.getValue(),
      roles: roleRes.getValue(),
      sexo: sexoRes.getValue(),
      createdAt: dateRes.getValue(),
      fechaNacimiento: FechaNacimientoRes.getValue(),
      password: passwordRes.getValue(),
    });

    const userSaveResult = await this.repository.save(user);
    if (!userSaveResult.isValid) {
      return userSaveResult;
    }

    const preferenceResult = await this.savePreference.run(
      idRes.getValue().value,
      BasePreference.profileImg,
      BasePreference.unitMeasure,
      BasePreference.thresholds,
      BasePreference.insulinRatios,
      BasePreference.sensitivity
    );

    if (!preferenceResult.isValid) {
      return Result.fail(preferenceResult.getError());
    }

    return userSaveResult;
  }
}
