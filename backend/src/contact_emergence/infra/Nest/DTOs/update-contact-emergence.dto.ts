import { PartialType } from '@nestjs/mapped-types';
import { CreateContactEmergenceDTO } from './create-contact-emergence.dto';

export class UpdateContactEmergenceDTO extends PartialType(CreateContactEmergenceDTO) {}
