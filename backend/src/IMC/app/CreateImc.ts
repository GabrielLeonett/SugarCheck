import { Imc } from '../core/Imc';
import { ImcRepository } from '../core/ImcRepository';
import { ErrorAbstract } from '../../shared/error-abstract';
import { Result } from '../../shared/result';
import { UserId } from '../../shared/core/value-objects/UserId';
import { Id_IMC } from '../core/value-objects/Id_IMC';
import { Peso } from '../core/value-objects/peso';
import { Altura } from '../core/value-objects/altura';
import { Fecha } from '../core/value-objects/Fecha';
import { GenerateUUIDInterface } from '../../shared/application/ports/generate-uuid.interface';
import { CreateNotification } from '../../notification/app/CreateNotification';
import { DrasticWeightChangeError } from '../core/errors/DrasticWeightChangeError';
import { FechaInvalidaError } from '../core/errors/FechaInvalidError';

const MAX_WEIGHT_CHANGE_KG = 5;
const CATEGORY_KEYS: Record<string, string> = {
  underweight: 'IMC_CATEGORY_UNDERWEIGHT',
  normal: 'IMC_CATEGORY_NORMAL',
  overweight: 'IMC_CATEGORY_OVERWEIGHT',
};

export class CreateImc {
  constructor(
    private readonly repository: ImcRepository,
    private readonly generateUUID: GenerateUUIDInterface,
    private readonly createNotification: CreateNotification,
  ) {}

  public async run(data: {
    userId: string;
    peso: number;
    altura: number;
    dia: number;
    mes: number;
    anio: number;
    lang?: string;
  }): Promise<Result<Imc, ErrorAbstract>> {
    const id = this.generateUUID.run();
    const idRes = Id_IMC.create(id);
    if (!idRes.isValid) return Result.fail(idRes.getError());

    const userIdRes = UserId.create(data.userId);
    if (!userIdRes.isValid) return Result.fail(userIdRes.getError());

    const pesoRes = Peso.create(data.peso);
    if (!pesoRes.isValid) return Result.fail(pesoRes.getError());

    const alturaRes = Altura.create(data.altura);
    if (!alturaRes.isValid) return Result.fail(alturaRes.getError());

    const fechaRes = Fecha.crear(data.dia, data.mes, data.anio);
    if (!fechaRes.isValid) return Result.fail(fechaRes.getError());

    const now = new Date();
    const hoy = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (fechaRes.getValue().valor > hoy) {
      return Result.fail(
        new FechaInvalidaError('La fecha no puede ser posterior al día de hoy'),
      );
    }

    const lastImcResult = await this.repository.getAllByUserId(userIdRes.getValue());
    if (lastImcResult.isValid) {
      const records = lastImcResult.getValue();
      if (records.length > 0) {
        const lastWeight = records[0].peso.value;
        const diff = Math.abs(data.peso - lastWeight);
        if (diff > MAX_WEIGHT_CHANGE_KG) {
          return Result.fail(
            new DrasticWeightChangeError(
              `El peso no puede cambiar más de ${MAX_WEIGHT_CHANGE_KG} kg de un registro a otro. Peso anterior: ${lastWeight} kg, peso ingresado: ${data.peso} kg`,
            ),
          );
        }
      }
    }

    const imc = new Imc({
      id: idRes.getValue(),
      userId: userIdRes.getValue(),
      peso: pesoRes.getValue(),
      altura: alturaRes.getValue(),
      fecha: fechaRes.getValue(),
    });

    const saveResult = await this.repository.save(imc);
    if (!saveResult.isValid) return saveResult;

    const imcValue = saveResult.getValue().toPlain().imcValue;
    let catKey = 'normal';
    if (imcValue < 18.5) catKey = 'underweight';
    else if (imcValue >= 25) catKey = 'overweight';

    const notifResult = await this.createNotification.run({
      userId: data.userId,
      type: 'info',
      titleKey: 'IMC_CREATION_TITLE',
      messageKey: 'IMC_CREATION_MESSAGE',
      params: {
        value: imcValue.toFixed(1),
        categoryKey: CATEGORY_KEYS[catKey],
      },
      link: '/bitacora/monitoreo-fisico',
    });
    if (!notifResult.isValid) {
      console.warn('Notificación IMC no creada:', notifResult.getError().message);
    }

    return saveResult;
  }
}
