import { Test, TestingModule } from '@nestjs/testing';
import { EmployeeController } from './employee.controller';
import { EmployeeService } from '../services/employee.service';
import { CreateEmployeeDto } from '../dto/create-employee.dto';
import { UpdateEmployeeDto } from '../dto/update-employee.dto';
import { Employee } from '../entity/employee.entity';

describe('EmployeeController', () => {
    let controller: EmployeeController;
    let service: EmployeeService;

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

    const mockEmployeeService = {
        createEmployee: jest.fn(),
        getAllEmployees: jest.fn(),
        getEmployeeById: jest.fn(),
        updateEmployee: jest.fn(),
        deleteEmployee: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [EmployeeController],
            providers: [
                {
                    provide: EmployeeService,
                    useValue: mockEmployeeService,
                },
            ],
        }).compile();

        controller = module.get<EmployeeController>(EmployeeController);
        service = module.get<EmployeeService>(EmployeeService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('createEmployee', () => {
        it('should create an employee', async () => {
            mockEmployeeService.createEmployee.mockResolvedValue(mockEmployee);

            const result = await controller.createEmployee(mockCreateEmployeeDto);

            expect(service.createEmployee).toHaveBeenCalledWith(mockCreateEmployeeDto);
            expect(result).toEqual(mockEmployee);
        });
    });

    describe('getAllEmployees', () => {
        it('should return an array of employees', async () => {
            mockEmployeeService.getAllEmployees.mockResolvedValue([mockEmployee]);

            const result = await controller.getAllEmployees();

            expect(service.getAllEmployees).toHaveBeenCalled();
            expect(result).toEqual([mockEmployee]);
        });
    });

    describe('getEmployeeById', () => {
        it('should return an employee by id', async () => {
            mockEmployeeService.getEmployeeById.mockResolvedValue(mockEmployee);

            const result = await controller.getEmployeeById(mockEmployee.id);

            expect(service.getEmployeeById).toHaveBeenCalledWith(mockEmployee.id);
            expect(result).toEqual(mockEmployee);
        });
    });

    describe('updateEmployee', () => {
        it('should update an employee', async () => {
            const updatedEmployee = { ...mockEmployee, ...mockUpdateEmployeeDto };
            mockEmployeeService.updateEmployee.mockResolvedValue(updatedEmployee);

            const result = await controller.updateEmployee(
                mockEmployee.id,
                mockUpdateEmployeeDto,
            );

            expect(service.updateEmployee).toHaveBeenCalledWith(
                mockEmployee.id,
                mockUpdateEmployeeDto,
            );
            expect(result).toEqual(updatedEmployee);
        });
    });

    describe('deleteEmployee', () => {
        it('should delete an employee', async () => {
            mockEmployeeService.deleteEmployee.mockResolvedValue(undefined);

            await controller.deleteEmployee(mockEmployee.id);

            expect(service.deleteEmployee).toHaveBeenCalledWith(mockEmployee.id);
        });
    });
});