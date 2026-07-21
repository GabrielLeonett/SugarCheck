import { Glucose } from '../core/Glucose';
import { GlucoseRepository } from '../core/GlucoseRepository';
import { ErrorAbstract } from '../../shared/error-abstract';
import { Result } from '../../shared/result';
import { UserId } from '../../shared/core/value-objects/UserId';
import { GlucoseId } from '../core/value-objects/GlucoseId';
import { GlucoseValue } from '../core/value-objects/GlucoseValue';
import { GlucoseMealTag } from '../core/value-objects/GlucoseMealTag';
import { GlucoseDate } from '../core/value-objects/GlucoseDate';
import { GlucoseTime } from '../core/value-objects/GlucoseTime';
import { GenerateUUIDInterface } from '../../shared/application/ports/generate-uuid.interface';
import { GetOneByIdPreference } from '../../preference/app/GetOneByUserIdPreference';
import { CreateNotification } from '../../notification/app/CreateNotification';

export class CreateGlucose {
  constructor(
    private readonly repository: GlucoseRepository,
    private readonly generateUUID: GenerateUUIDInterface,
    private readonly getPreference: GetOneByIdPreference,
    private readonly createNotification: CreateNotification,
  ) {}

  public async run(data: {
    userId: string;
    valueMgdl: number;
    mealTag: string;
    date: Date | string;
    time: string;
  }): Promise<Result<Glucose, ErrorAbstract>> {
    const id = this.generateUUID.run();
    const idRes = GlucoseId.create(id);
    if (!idRes.isValid) return Result.fail(idRes.getError());

    const userIdRes = UserId.create(data.userId);
    if (!userIdRes.isValid) return Result.fail(userIdRes.getError());

    const valueRes = GlucoseValue.create(data.valueMgdl);
    if (!valueRes.isValid) return Result.fail(valueRes.getError());

    const mealTagRes = GlucoseMealTag.create(data.mealTag);
    if (!mealTagRes.isValid) return Result.fail(mealTagRes.getError());

    const dateRes = GlucoseDate.create(data.date);
    if (!dateRes.isValid) return Result.fail(dateRes.getError());

    const timeRes = GlucoseTime.create(data.time);
    if (!timeRes.isValid) return Result.fail(timeRes.getError());

    const glucose = new Glucose({
      id: idRes.getValue(),
      userId: userIdRes.getValue(),
      valueMgdl: valueRes.getValue(),
      mealTag: mealTagRes.getValue(),
      date: dateRes.getValue(),
      time: timeRes.getValue(),
      createdAt: new Date(),
    });

    const saveResult = await this.repository.save(glucose);
    if (!saveResult.isValid) return saveResult;

    let alert: string | null = null;
    try {
      const prefResult = await this.getPreference.run({ id: data.userId });
      if (prefResult.isValid) {
        const prefs = prefResult.getValue().toPlain();
        const thresholds = prefs.thresholds;
        if (prefs.unitMeasure === 'mg/dL' || !prefs.unitMeasure) {
          if (data.valueMgdl < thresholds.hypo) {
            alert = 'hipoglucemia';
          } else if (data.valueMgdl > thresholds.hiper) {
            alert = 'hiperglucemia';
          }
        }
      }
    } catch {
      // Si falla la lectura de preferencias, continuamos sin alerta
    }

    if (alert) {
      const alertKey = alert === 'hipoglucemia' ? 'GLUCOSE_ALERT_HYPO' : 'GLUCOSE_ALERT_HYPER';
      const alertMsg = alert === 'hipoglucemia' ? 'GLUCOSE_ALERT_HYPO_MESSAGE' : 'GLUCOSE_ALERT_HYPER_MESSAGE';
      const notifResult = await this.createNotification.run({
        userId: data.userId,
        type: 'warning',
        titleKey: alertKey,
        messageKey: alertMsg,
        params: { value: String(data.valueMgdl) },
        link: '/bitacora/glucemia',
      });
      if (!notifResult.isValid) {
        console.warn('Notificación de alerta de glucosa no creada:', notifResult.getError().message);
      }
    }

    const saved = saveResult.getValue();
    return Result.ok(new Glucose({
      id: saved.id,
      userId: saved.userId,
      valueMgdl: saved.valueMgdl,
      mealTag: saved.mealTag,
      date: saved.date,
      time: saved.time,
      createdAt: saved.createdAt,
    }));
  }
}
