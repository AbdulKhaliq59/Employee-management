import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put } from "@nestjs/common";
import { EmployeeService } from "../services/employee.service";
import { CreateEmployeeDto } from "../dto/create-employee.dto";
import { Employee } from "../entity/employee.entity";
import { UpdateEmployeeDto } from "../dto/update-employee.dto";


@Controller('employees')
export class EmployeeController {
    constructor(private employeeService: EmployeeService) { }

    @Post()
    async createEmployee(@Body() createEmployeeDto: CreateEmployeeDto): Promise<Employee> {
        return await this.employeeService.createEmployee(createEmployeeDto);
    }
    @Get()
    async getAllEmployees(): Promise<Employee[]> {
        return await this.employeeService.getAllEmployees();
    }

    @Get(':id')
    async getEmployeeById(@Param('id', ParseUUIDPipe) id: string): Promise<Employee> {
        return await this.employeeService.getEmployeeById(id);
    }

    @Put(':id')
    async updateEmployee(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateEmployeeDto: UpdateEmployeeDto,
    ): Promise<Employee> {
        return await this.employeeService.updateEmployee(id, updateEmployeeDto);
    }

    @Delete(':id')
    async deleteEmployee(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
        return await this.employeeService.deleteEmployee(id);
    }
}
