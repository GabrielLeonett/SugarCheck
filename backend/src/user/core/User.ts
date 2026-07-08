import { UserUsername } from './value-objects/UserUsername';
import { UserEmail } from './value-objects/UserEmail';
import { UserRoles } from './value-objects/UserRoles';
import { UserCreatedAt } from './value-objects/UserCreatedAt';
import { UserFechaNacimiento } from './value-objects/UserFechaNacimiento';
import { UserPassword } from './value-objects/UserPassword';
import { UserSexo } from './value-objects/UserSexo';
import { UserId } from '../../shared/core/value-objects/UserId';

interface UserProps {
  id: UserId;
  username: UserUsername;
  password: UserPassword;
  email: UserEmail;
  roles: UserRoles;
  sexo: UserSexo;
  createdAt: UserCreatedAt;
  fechaNacimiento: UserFechaNacimiento;
}

export interface UserPlain {
  id: string;
  username: string;
  password: string;
  email: string;
  roles: string[];
  sexo: string;
  createdAt: Date;
  fechaNacimiento: Date;
}

export class User {
  private readonly _id: UserId;
  private _username: UserUsername;
  private readonly _email: UserEmail;
  private readonly _password: UserPassword;
  private readonly _roles: UserRoles;
  private readonly _sexo: UserSexo;
  private readonly _createdAt: UserCreatedAt;
  private readonly _fechaNacimiento: UserFechaNacimiento;

  constructor(props: UserProps) {
    this._id = props.id;
    this._username = props.username;
    this._password = props.password;
    this._email = props.email;
    this._roles = props.roles;
    this._sexo = props.sexo;
    this._fechaNacimiento = props.fechaNacimiento;
    this._createdAt = props.createdAt;
  }

  get id(): UserId {
    return this._id;
  }
  get username(): UserUsername {
    return this._username;
  }
  get email(): UserEmail {
    return this._email;
  }
  get roles(): UserRoles {
    return this._roles;
  }
  get sexo(): UserSexo {
    return this._sexo;
  }
  get createdAt(): UserCreatedAt {
    return this._createdAt;
  }
  get fechaNacimiento(): UserFechaNacimiento {
    return this._fechaNacimiento;
  }
  get password(): UserPassword {
    return this._password;
  }

  public toPlain(): UserPlain {
    return {
      id: this._id.value,
      username: this._username.value,
      email: this._email.value,
      password: this._password.value,
      roles: this._roles.value,
      sexo: this._sexo.value,
      createdAt: this._createdAt.value,
      fechaNacimiento: this._fechaNacimiento.value,
    };
  }
}
