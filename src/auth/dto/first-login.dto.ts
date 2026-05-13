import { IsString, MinLength } from "class-validator";

export class FirstLoginDto {
    @IsString()
    email: string;

    @IsString()
    temporaryPassoword: string;

    @IsString()
    @MinLength(8)
    newPassword: string;

    @IsString()
    confirmNewPassword: string;
}