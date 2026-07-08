import { UserId } from '../../shared/core/value-objects/UserId';

interface ContactEmergenceProps {
  userId: UserId;
}

// Interfaz para datos planos (DPO / Persistencia)
export interface ContactEmergencePlain {
  userId: string;
}

export class ContactEmergence {
  private readonly _userId: UserId;

  constructor(props: ContactEmergenceProps) {
    this._userId = props.userId;
  }

  // Getters para acceder a los Value Objects desde la lógica de dominio
  get userId(): UserId { return this._userId; }

  public toPlain(): ContactEmergencePlain {
    return {
      userId: this._userId.value,
    };
  }
}