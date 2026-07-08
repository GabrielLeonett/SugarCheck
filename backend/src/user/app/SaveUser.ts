import { User } from '../core/User';
import { UserRepository } from '../core/UserRepository';
import { ErrorAbstract } from '../../shared/error-abstract';
import { Result } from '../../shared/result';
import { UserId } from '../../shared/core/value-objects/UserId';
import { UserName } from '../core/value-objects/UserName';
import { UserEmail } from '../core/value-objects/UserEmail';
import { UserRoles } from '../core/value-objects/UserRoles';
import { UserCreatedAt } from '../core/value-objects/UserCreatedAt';
import { UserFechaNacimiento } from '../core/value-objects/UserFechaNacimiento';
import { PasswordHasher } from '../../shared/application/ports/password-hasher.interface';
import { UserPassword } from '../core/value-objects/UserPassword';
import { GenerateUUIDInterface } from '../../shared/application/ports/generate-uuid.interface';
import { SavePreference } from '../../preference/app/SavePreference';

const BasePreference = {
  unitMeasure: "mg/dL",
  profileImg: "../../../assets/profile/GlucoAstro.png",
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
    email: string;
    roles: string[];
    fechaNacimiento: Date;
    password: string;
  }): Promise<Result<User, ErrorAbstract>> {
    
    // 1. Validaciones y Creación de Value Objects
    const id = await this.generateUUID.run();
    const idRes = UserId.create(id);
    if (!idRes.isValid) return Result.fail(idRes.getError());

    const nameRes = UserName.create(data.name);
    if (!nameRes.isValid) return Result.fail(nameRes.getError());

    const emailRes = UserEmail.create(data.email);
    if (!emailRes.isValid) return Result.fail(emailRes.getError());

    const roleRes = UserRoles.create(data.roles);
    if (!roleRes.isValid) return Result.fail(roleRes.getError());

    const dateRes = UserCreatedAt.create(new Date());
    if (!dateRes.isValid) return Result.fail(dateRes.getError());

    const FechaNacimientoRes = UserFechaNacimiento.create(data.fechaNacimiento);
    if (!FechaNacimientoRes.isValid) return Result.fail(FechaNacimientoRes.getError());

    const hashedPass = await this.passwordHasher.hash(data.password);
    const passwordRes = UserPassword.create(hashedPass);
    if (!passwordRes.isValid) return Result.fail(passwordRes.getError());

    // 2. Instanciación de la Entidad de Dominio User
    const user = new User({
      id: idRes.getValue(),
      name: nameRes.getValue(),
      email: emailRes.getValue(),
      roles: roleRes.getValue(),
      createdAt: dateRes.getValue(),
      fechaNacimiento: FechaNacimientoRes.getValue(),
      password: passwordRes.getValue(),
    });

    // ➔ 3. PERSISTENCIA EN BD: Guardamos primero el usuario para satisfacer la FK
    const userSaveResult = await this.repository.save(user);

    // Si el guardado del usuario en PostgreSQL falla, detenemos el proceso inmediatamente
    if (!userSaveResult.isValid) {
      return userSaveResult;
    }

    // ➔ 4. PERSISTENCIA EN BD SEGUNDARIA: Ahora que el usuario existe, guardamos sus preferencias
    const preferenceResult = await this.savePreference.run(
      idRes.getValue().value, // Extrae el string primitivo del UUID
      BasePreference.profileImg,
      BasePreference.unitMeasure,
      BasePreference.thresholds,
      BasePreference.insulinRatios,
      BasePreference.sensitivity
    );

    // Si las preferencias fallan (por validación interna o error de Prisma)
    if (!preferenceResult.isValid) {
      return Result.fail(preferenceResult.getError());
    }

    // 5. Todo salió perfecto, devolvemos el resultado exitoso del usuario
    return userSaveResult;
  }
}