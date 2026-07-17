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
import { getImcNotifText } from '../core/imc-notification-translations';

const CATEGORY_TRANSLATIONS: Record<string, Record<string, string>> = {
  es: { underweight: 'Bajo peso', normal: 'Normal', overweight: 'Sobrepeso' },
  en: { underweight: 'Underweight', normal: 'Normal', overweight: 'Overweight' },
  pt: { underweight: 'Abaixo do peso', normal: 'Normal', overweight: 'Sobrepeso' },
  ja: { underweight: '\u30d5\u30a9\u30fc\u30b5\u30fc', normal: '\u6a19\u6e96', overweight: '\u30aa\u30fc\u30d0\u30fc' },
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
    const lang = data.lang || 'es';
    const cats = CATEGORY_TRANSLATIONS[lang] || CATEGORY_TRANSLATIONS.es;
    let catKey = 'normal';
    if (imcValue < 18.5) catKey = 'underweight';
    else if (imcValue >= 25) catKey = 'overweight';

    const notifResult = await this.createNotification.run({
      userId: data.userId,
      type: 'info',
      title: getImcNotifText(lang, 'creationTitle'),
      message: getImcNotifText(lang, 'creationMessage', {
        value: imcValue.toFixed(1),
        category: cats[catKey],
      }),
      link: '/bitacora/monitoreo-fisico',
    });
    if (!notifResult.isValid) {
      console.warn('Notificación IMC no creada:', notifResult.getError().message);
    }

    return saveResult;
  }
}
