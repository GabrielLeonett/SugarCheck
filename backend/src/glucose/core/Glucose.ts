import { UserId } from '../../shared/core/value-objects/UserId';
import { GlucoseId } from './value-objects/GlucoseId';
import { GlucoseValue } from './value-objects/GlucoseValue';
import { GlucoseMealTag } from './value-objects/GlucoseMealTag';
import { GlucoseDate } from './value-objects/GlucoseDate';
import { GlucoseTime } from './value-objects/GlucoseTime';

interface GlucoseProps {
  id: GlucoseId;
  userId: UserId;
  valueMgdl: GlucoseValue;
  mealTag: GlucoseMealTag;
  date: GlucoseDate;
  time: GlucoseTime;
  createdAt: Date;
}

export interface GlucosePlain {
  id: string;
  userId: string;
  valueMgdl: number;
  mealTag: string;
  date: string;
  time: string;
  createdAt: string;
  alert: string | null;
}

export class Glucose {
  private readonly _id: GlucoseId;
  private readonly _userId: UserId;
  private readonly _valueMgdl: GlucoseValue;
  private readonly _mealTag: GlucoseMealTag;
  private readonly _date: GlucoseDate;
  private readonly _time: GlucoseTime;
  private readonly _createdAt: Date;

  constructor(props: GlucoseProps) {
    this._id = props.id;
    this._userId = props.userId;
    this._valueMgdl = props.valueMgdl;
    this._mealTag = props.mealTag;
    this._date = props.date;
    this._time = props.time;
    this._createdAt = props.createdAt;
  }

  get id(): GlucoseId { return this._id; }
  get userId(): UserId { return this._userId; }
  get valueMgdl(): GlucoseValue { return this._valueMgdl; }
  get mealTag(): GlucoseMealTag { return this._mealTag; }
  get date(): GlucoseDate { return this._date; }
  get time(): GlucoseTime { return this._time; }
  get createdAt(): Date { return this._createdAt; }

  public toPlain(alert: string | null = null): GlucosePlain {
    return {
      id: this._id.value,
      userId: this._userId.value,
      valueMgdl: this._valueMgdl.value,
      mealTag: this._mealTag.value,
      date: this._date.value.toISOString(),
      time: this._time.value,
      createdAt: this._createdAt.toISOString(),
      alert,
    };
  }
}
