import { IsString, IsOptional, IsNotEmpty, IsUrl, IsEnum, IsNumber, IsArray, ValidateNested, Min, ValidateIf } from 'class-validator';
import { Type } from 'class-transformer';
import { PriceType, UnitType } from '@prisma/client';

export class CreateProductPriceDto {
  @IsEnum(PriceType, { message: 'El tipo de precio no es válido' })
  type: PriceType;

  @IsNumber({}, { message: 'La cantidad mínima debe ser un número' })
  @Min(1, { message: 'La cantidad mínima debe ser al menos 1' })
  @IsOptional()
  minQuantity?: number;

  @IsNumber({}, { message: 'El precio debe ser un número' })
  @Min(0, { message: 'El precio no puede ser negativo' })
  price: number;
}

export class CreateProductDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre del producto es obligatorio' })
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @ValidateIf(o => o.imageUrl !== '' && o.imageUrl !== null && o.imageUrl !== undefined)
  @IsUrl({}, { message: 'La imagen debe ser una URL válida' })
  @IsOptional()
  imageUrl?: string;

  @IsEnum(UnitType, { message: 'El tipo de unidad no es válido (KG, GR, LT, ML, UNIDAD)' })
  unitType: UnitType;

  @IsNumber({}, { message: 'El ID del supermercado debe ser un número' })
  supermarketId: number;

  @IsNumber({}, { message: 'El ID de la categoría debe ser un número' })
  categoryId: number;

  @IsNumber({}, { message: 'El ID de la marca debe ser un número' })
  brandId: number;

  @IsArray({ message: 'Debe proporcionar al menos un precio' })
  @ValidateNested({ each: true })
  @Type(() => CreateProductPriceDto)
  prices: CreateProductPriceDto[];
}