import { IsEmail, IsNotEmpty } from 'class-validator';

export class UpdateEmailDTO {
  @IsEmail({}, { message: 'El formato del correo es incorrecto' })
  @IsNotEmpty({ message: 'El correo es obligatorio' })
  email!: string;
}
