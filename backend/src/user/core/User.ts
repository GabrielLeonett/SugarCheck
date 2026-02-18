import { UserName } from './UserName';
import { UserId } from './UserId';
import { UserEmail } from './UserEmail';
import { UserRoles } from './UserRoles';
import { UserCreatedAt } from './UserCreatedAt';

interface UserProps {
  id: UserId;
  name: UserName;
  email: UserEmail;
  roles: UserRoles;
  createdAt: UserCreatedAt;
}

// Este es el tipo de datos "planos" que devolverá el método
export interface UserPlain {
  id: string;
  name: string;
  email: string;
  roles: string[];
  createdAt: Date;
}

export class User {
  private readonly _id: UserId;
  private _name: UserName;
  private readonly _email: UserEmail;
  private readonly _roles: UserRoles;
  private readonly _createdAt: UserCreatedAt;

  constructor(props: UserProps) {
    this._id = props.id;
    this._name = props.name;
    this._email = props.email;
    this._roles = props.roles;
    this._createdAt = props.createdAt;
  }

  // Getters
  get id(): UserId {
    return this._id;
  }
  get name(): UserName {
    return this._name;
  }
  get email(): UserEmail {
    return this._email;
  }
  get roles(): UserRoles {
    return this._roles;
  }
  get createdAt(): UserCreatedAt {
    return this._createdAt;
  }

  public toPlain(): UserPlain {
    return {
      id: this._id.value,
      name: this._name.value,
      email: this._email.value,
      roles: this._roles.value,
      createdAt: this._createdAt.value,
    };
  }
}
