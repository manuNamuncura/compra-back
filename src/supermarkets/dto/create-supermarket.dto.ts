import { IsString, IsOptional, IsNotEmpty, IsUrl, ValidateIf } from 'class-validator';

export class CreateSupermarketDto {
    @IsString()
    @IsNotEmpty({ message: 'El nombre no puede estar vacío' })
    name: string;

    @IsString()
    @IsOptional()
    address?: string;
    
    @ValidateIf(o => o.logoUrl !== '' && o.logoUrl !== null && o.logoUrl !== undefined)
    @IsUrl({}, { message: 'El logo debe ser una URL válida' })
    @IsOptional()
    logoUrl?: string;
}