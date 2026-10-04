import { PartialType } from '@nestjs/mapped-types';
import { CreateHbA1cDTO } from './create-hba1c.dto';

export class UpdateHbA1cDTO extends PartialType(CreateHbA1cDTO) {}
