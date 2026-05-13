import { IsNotEmpty, IsOptional, IsString, ValidateIf } from "class-validator";

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty({ message: "El nombre no puede estar vacio" })
  name: string;

  @IsString()
  @IsOptional()
  description?: string;
}
