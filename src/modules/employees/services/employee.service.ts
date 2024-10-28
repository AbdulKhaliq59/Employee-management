import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateEmployeeDto } from '../dto/create-employee.dto';
import { UpdateEmployeeDto } from '../dto/update-employee.dto';
import { Employee } from '../entity/employee.entity';

@Injectable()
export class EmployeeService {
    constructor(
        @InjectRepository(Employee)
        private employeeRepository: Repository<Employee>,
    ) { }

    async createEmployee(createEmployeeDto: CreateEmployeeDto): Promise<Employee> {
        const employee = this.employeeRepository.create(createEmployeeDto);
        return await this.employeeRepository.save(employee);
    }

    async getAllEmployees(): Promise<Employee[]> {
        return await this.employeeRepository.find();
    }

    async getEmployeeById(id: string): Promise<Employee> {
        const employee = await this.employeeRepository.findOne({ where: { id } });
        if (!employee) throw new NotFoundException(`Employee with ID ${id} not found`);
        return employee;
    }

    async updateEmployee(id: string, updateEmployeeDto: UpdateEmployeeDto): Promise<Employee> {
        await this.employeeRepository.update(id, updateEmployeeDto);
        return this.getEmployeeById(id);
    }

    async deleteEmployee(id: string): Promise<void> {
        const result = await this.employeeRepository.delete(id);
        if (result.affected === 0) throw new NotFoundException(`Employee with ID ${id} not found`);
    }
}
