import { HbA1c } from '../core/HbA1c';
import { HbA1cRepository } from '../core/HbA1cRepository';
import { ErrorAbstract } from '../../shared/error-abstract';
import { Result } from '../../shared/result';
import { UserId } from '../../shared/core/value-objects/UserId';
import { HbA1cId } from '../core/value-objects/HbA1cId';
import { HbA1cValue } from '../core/value-objects/HbA1cValue';
import { HbA1cExamDate } from '../core/value-objects/HbA1cExamDate';
import { GenerateUUIDInterface } from '../../shared/application/ports/generate-uuid.interface';

export class CreateHbA1c {
  constructor(
    private readonly repository: HbA1cRepository,
    private readonly generateUUID: GenerateUUIDInterface,
  ) {}

  public async run(data: {
    userId: string;
    valuePercent: number;
    examDate: Date | string;
  }): Promise<Result<HbA1c, ErrorAbstract>> {
    const id = this.generateUUID.run();
    const idRes = HbA1cId.create(id);
    if (!idRes.isValid) return Result.fail(idRes.getError());

    const userIdRes = UserId.create(data.userId);
    if (!userIdRes.isValid) return Result.fail(userIdRes.getError());

    const valueRes = HbA1cValue.create(data.valuePercent);
    if (!valueRes.isValid) return Result.fail(valueRes.getError());

    const examDateRes = HbA1cExamDate.create(data.examDate);
    if (!examDateRes.isValid) return Result.fail(examDateRes.getError());

    const hba1c = new HbA1c({
      id: idRes.getValue(),
      userId: userIdRes.getValue(),
      valuePercent: valueRes.getValue(),
      examDate: examDateRes.getValue(),
      createdAt: new Date(),
    });

    return await this.repository.save(hba1c);
  }
}
