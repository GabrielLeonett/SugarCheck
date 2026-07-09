import { UserId } from '../../shared/core/value-objects/UserId';
import { ContactEmergenceId } from './value-objects/ContactEmergenceId';
import { ContactName } from './value-objects/ContactName';
import { ContactParentesco } from './value-objects/ContactParentesco';

interface ContactEmergenceProps {
  id: ContactEmergenceId;
  userId: UserId;
  name: ContactName;
  parentesco: ContactParentesco;
  telefono?: string;
}

export interface ContactEmergencePlain {
  id: string;
  userId: string;
  name: string;
  parentesco: string;
  telefono?: string;
}

export class ContactEmergence {
  private readonly _id: ContactEmergenceId;
  private readonly _userId: UserId;
  private _name: ContactName;
  private _parentesco: ContactParentesco;
  private _telefono?: string;

  constructor(props: ContactEmergenceProps) {
    this._id = props.id;
    this._userId = props.userId;
    this._name = props.name;
    this._parentesco = props.parentesco;
    this._telefono = props.telefono;
  }

  get id(): ContactEmergenceId { return this._id; }
  get userId(): UserId { return this._userId; }
  get name(): ContactName { return this._name; }
  get parentesco(): ContactParentesco { return this._parentesco; }
  get telefono(): string | undefined { return this._telefono; }

  public toPlain(): ContactEmergencePlain {
    return {
      id: this._id.value,
      userId: this._userId.value,
      name: this._name.value,
      parentesco: this._parentesco.value,
      telefono: this._telefono,
    };
  }
}
