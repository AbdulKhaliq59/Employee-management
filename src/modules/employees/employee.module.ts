import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Employee } from "./entity/employee.entity";
import { EmployeeService } from "./services/employee.service";
import { EmployeeController } from "./controllers/employee.controller";


@Module({
    imports: [TypeOrmModule.forFeature([Employee])],
    providers: [EmployeeService],
    controllers: [EmployeeController],
    exports: [EmployeeService]
})

export class EmployeeModule { }