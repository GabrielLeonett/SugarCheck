import { IsString, IsNotEmpty, IsEmail } from 'class-validator';

export class ForgotPasswordDTO {
  @IsString()
  @IsNotEmpty({ message: 'El correo electrónico es obligatorio' })
  @IsEmail({}, { message: 'El formato del correo no es válido' })
  email!: string;
}
