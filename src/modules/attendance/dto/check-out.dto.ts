import { IsUUID } from "class-validator";

export class CheckOutDto {
    @IsUUID()
    employeeId: string;
}