import { IsNotEmpty, IsString } from 'class-validator';

export class LoginFirebaseDTO {
  @IsString()
  @IsNotEmpty()
  token!: string;
}