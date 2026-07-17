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
import { TranslationService } from '../../shared/infrastructure/i18n/translation.service';

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
    private readonly translationService: TranslationService,
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
    let catKey = 'normal';
    if (imcValue < 18.5) catKey = 'underweight';
    else if (imcValue >= 25) catKey = 'overweight';

    const category = this.translationService.translate(CATEGORY_KEYS[catKey], lang);

    const notifResult = await this.createNotification.run({
      userId: data.userId,
      type: 'info',
      title: this.translationService.translate('IMC_CREATION_TITLE', lang),
      message: this.translationService.translate('IMC_CREATION_MESSAGE', lang, {
        value: imcValue.toFixed(1),
        category,
      }),
      link: '/bitacora/monitoreo-fisico',
    });
    if (!notifResult.isValid) {
      console.warn('Notificación IMC no creada:', notifResult.getError().message);
    }

    return saveResult;
  }
}
