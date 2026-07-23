import { PartialType } from '@nestjs/mapped-types';
import { CreateImcDTO } from './create-imc.dto';

export class UpdateImcDTO extends PartialType(CreateImcDTO) {}
