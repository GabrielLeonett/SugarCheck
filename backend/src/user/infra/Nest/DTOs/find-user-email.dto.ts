import { IsEmail } from "class-validator";

export class FindUserEmailDTO {
  @IsEmail({}, { message: 'El formato del correo es incorrecto' })
  email!: string;
}