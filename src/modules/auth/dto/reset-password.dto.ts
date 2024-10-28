import { IsNotEmpty, MinLength } from "class-validator";

export class ResetPasswordDto {
    @IsNotEmpty()
    @MinLength(6)
    readonly newPassword: string;
}