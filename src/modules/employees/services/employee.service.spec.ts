import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmployeeService } from './employee.service';
import { Employee } from '../entity/employee.entity';
import { CreateEmployeeDto } from '../dto/create-employee.dto';
import { UpdateEmployeeDto } from '../dto/update-employee.dto';
import { NotFoundException } from '@nestjs/common';

describe('EmployeeService', () => {
    let service: EmployeeService;
    let repository: Repository<Employee>;

    const mockEmployee: Employee = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'John Doe',
        email: 'john@example.com',
        employeeIdentifier: 'EMP001',
        phoneNumber: '+1234567890',
        attendanceRecords: []
    };

    const mockCreateEmployeeDto: CreateEmployeeDto = {
        name: 'John Doe',
        email: 'john@example.com',
        employeeIdentifier: 'EMP001',
        phoneNumber: '+1234567890'
    };

    const mockUpdateEmployeeDto: UpdateEmployeeDto = {
        name: 'John Updated',
        phoneNumber: '+1987654321'
    };

    const mockRepository = {
        create: jest.fn(),
        save: jest.fn(),
        find: jest.fn(),
        findOne: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                EmployeeService,
                {
                    provide: getRepositoryToken(Employee),
                    useValue: mockRepository,
                },
            ],
        }).compile();

        service = module.get<EmployeeService>(EmployeeService);
        repository = module.get<Repository<Employee>>(getRepositoryToken(Employee));
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('createEmployee', () => {
        it('should successfully create an employee', async () => {
            mockRepository.create.mockReturnValue(mockEmployee);
            mockRepository.save.mockResolvedValue(mockEmployee);

            const result = await service.createEmployee(mockCreateEmployeeDto);

            expect(repository.create).toHaveBeenCalledWith(mockCreateEmployeeDto);
            expect(repository.save).toHaveBeenCalled();
            expect(result).toEqual(mockEmployee);
        });
    });

    describe('getAllEmployees', () => {
        it('should return an array of employees', async () => {
            mockRepository.find.mockResolvedValue([mockEmployee]);

            const result = await service.getAllEmployees();

            expect(repository.find).toHaveBeenCalled();
            expect(result).toEqual([mockEmployee]);
        });
    });

    describe('getEmployeeById', () => {
        it('should return an employee by id', async () => {
            mockRepository.findOne.mockResolvedValue(mockEmployee);

            const result = await service.getEmployeeById(mockEmployee.id);

            expect(repository.findOne).toHaveBeenCalledWith({
                where: { id: mockEmployee.id },
            });
            expect(result).toEqual(mockEmployee);
        });

        it('should throw NotFoundException when employee not found', async () => {
            mockRepository.findOne.mockResolvedValue(null);

            await expect(service.getEmployeeById('nonexistent-id')).rejects.toThrow(
                NotFoundException,
            );
        });
    });

    describe('updateEmployee', () => {
        it('should update an employee', async () => {
            const updatedEmployee = { ...mockEmployee, ...mockUpdateEmployeeDto };
            mockRepository.update.mockResolvedValue({ affected: 1 });
            mockRepository.findOne.mockResolvedValue(updatedEmployee);

            const result = await service.updateEmployee(mockEmployee.id, mockUpdateEmployeeDto);

            expect(repository.update).toHaveBeenCalledWith(mockEmployee.id, mockUpdateEmployeeDto);
            expect(result).toEqual(updatedEmployee);
        });
    });

    describe('deleteEmployee', () => {
        it('should delete an employee', async () => {
            mockRepository.delete.mockResolvedValue({ affected: 1 });

            await service.deleteEmployee(mockEmployee.id);

            expect(repository.delete).toHaveBeenCalledWith(mockEmployee.id);
        });

        it('should throw NotFoundException when employee not found', async () => {
            mockRepository.delete.mockResolvedValue({ affected: 0 });

            await expect(service.deleteEmployee('nonexistent-id')).rejects.toThrow(
                NotFoundException,
            );
        });
    });
});