import { UserId } from '../../shared/core/value-objects/UserId';
import { HbA1cId } from './value-objects/HbA1cId';
import { HbA1cValue } from './value-objects/HbA1cValue';
import { HbA1cExamDate } from './value-objects/HbA1cExamDate';

interface HbA1cProps {
  id: HbA1cId;
  userId: UserId;
  valuePercent: HbA1cValue;
  examDate: HbA1cExamDate;
  createdAt: Date;
}

export interface HbA1cPlain {
  id: string;
  userId: string;
  valuePercent: number;
  eag: number;
  examDate: string;
  createdAt: string;
  estado: string;
}

export class HbA1c {
  private readonly _id: HbA1cId;
  private readonly _userId: UserId;
  private readonly _valuePercent: HbA1cValue;
  private readonly _examDate: HbA1cExamDate;
  private readonly _eag: number;
  private readonly _createdAt: Date;

  constructor(props: HbA1cProps) {
    this._id = props.id;
    this._userId = props.userId;
    this._valuePercent = props.valuePercent;
    this._examDate = props.examDate;
    this._eag = (props.valuePercent.value * 28.7) - 46.7;
    this._createdAt = props.createdAt;
  }

  get id(): HbA1cId { return this._id; }
  get userId(): UserId { return this._userId; }
  get valuePercent(): HbA1cValue { return this._valuePercent; }
  get examDate(): HbA1cExamDate { return this._examDate; }
  get eag(): number { return this._eag; }
  get createdAt(): Date { return this._createdAt; }

  public toPlain(): HbA1cPlain {
    const now = new Date();
    const diffMs = now.getTime() - this._examDate.value.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const estado = diffDays > 90 ? 'Vencido' : 'Vigente';

    return {
      id: this._id.value,
      userId: this._userId.value,
      valuePercent: this._valuePercent.value,
      eag: Math.round(this._eag * 100) / 100,
      examDate: this._examDate.value.toISOString(),
      createdAt: this._createdAt.toISOString(),
      estado,
    };
  }
}
