import { PartialType } from '@nestjs/mapped-types';
import { CreateGlucoseDTO } from './create-glucose.dto';

export class UpdateGlucoseDTO extends PartialType(CreateGlucoseDTO) {}
