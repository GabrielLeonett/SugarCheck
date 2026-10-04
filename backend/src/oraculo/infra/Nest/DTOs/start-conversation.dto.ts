import { IsOptional, IsString, MaxLength } from 'class-validator';

export class StartConversationDTO {
  @IsOptional()
  @IsString({ message: 'El título debe ser un texto' })
  @MaxLength(120, { message: 'El título no puede superar 120 caracteres' })
  title?: string;
}
