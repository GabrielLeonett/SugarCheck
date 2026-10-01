import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsOptional,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { ThresholdsDTO, InsulinRatiosDTO, CorrectionSchemaItemDTO, BasalSchemaItemDTO } from './utils.dto';

export class SavePreferenceDTO {

  @IsString({ message: 'La URL de la imagen debe ser un texto' })
  @IsNotEmpty({ message: 'La URL de la imagen es obligatoria' })
  profileImg!: string;

  @IsString({ message: 'La unidad de medida debe ser un texto' })
  @IsNotEmpty({ message: 'La unidad de medida es obligatoria' })
  unitMeasure!: string;

  @ValidateNested({ message: 'Los umbrales tienen un formato incorrecto' })
  @Type(() => ThresholdsDTO)
  @IsNotEmpty({ message: 'Los umbrales son obligatorios' })
  thresholds!: ThresholdsDTO;

  @ValidateNested({
    message: 'Los ratios de insulina tienen un formato incorrecto',
  })
  @Type(() => InsulinRatiosDTO)
  @IsNotEmpty({ message: 'Los ratios de insulina son obligatorios' })
  insulinRatios!: InsulinRatiosDTO;

  @IsNumber({}, { message: 'El factor de sensibilidad debe ser un número' })
  @IsNotEmpty({ message: 'El factor de sensibilidad es obligatorio' })
  sensitivity!: number;

  @IsOptional()
  @ValidateNested({ each: true, message: 'Los esquemas de corrección tienen un formato incorrecto' })
  @Type(() => CorrectionSchemaItemDTO)
  correctionSchemas?: CorrectionSchemaItemDTO[];

  @IsOptional()
  @ValidateNested({ each: true, message: 'Los esquemas basales tienen un formato incorrecto' })
  @Type(() => BasalSchemaItemDTO)
  basalSchemas?: BasalSchemaItemDTO[];
}