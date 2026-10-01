import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class SendMessageDTO {
  @IsString({ message: 'El mensaje debe ser un texto' })
  @IsNotEmpty({ message: 'El mensaje es obligatorio' })
  @MaxLength(4000, { message: 'El mensaje no puede superar 4000 caracteres' })
  content!: string;
}
