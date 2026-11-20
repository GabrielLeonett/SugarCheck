import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class OAuthExchangeDTO {
  @IsString()
  @IsNotEmpty()
  @MinLength(16)
  code!: string;
}
