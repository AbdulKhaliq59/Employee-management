import { Test, TestingModule } from '@nestjs/testing';
import { AttendanceService } from './attendance.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attendance } from '../entities/attendance.entity';
import { EmployeeService } from '../../employees/services/employee.service';
import { EmailQueueService } from '../../email/services/email-queue.service';
import { Employee } from '../../employees/entity/employee.entity';
import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';

jest.mock('pdfkit');
jest.mock('exceljs');

describe('AttendanceService', () => {
    let service: AttendanceService;
    let attendanceRepository: jest.Mocked<Repository<Attendance>>;
    let employeeService: jest.Mocked<EmployeeService>;
    let emailQueueService: jest.Mocked<EmailQueueService>;

    const mockEmployee: Employee = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'John Doe',
        email: 'john.doe@example.com',
        employeeIdentifier: 'EMP001',
        phoneNumber: '+1234567890',
        attendanceRecords: []
    };

    const mockAttendance: Attendance = {
        id: '123e4567-e89b-12d3-a456-426614174001',
        employee: mockEmployee,
        checkInTime: new Date('2024-01-01T09:00:00Z'),
        checkOutTime: null
    };

    beforeEach(async () => {
        // Create mock implementations
        const mockAttendanceRepository = {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
        };

        const mockEmployeeServiceProvider = {
            provide: EmployeeService,
            useValue: {
                getEmployeeById: jest.fn(),
            },
        };

        const mockEmailQueueServiceProvider = {
            provide: EmailQueueService,
            useValue: {
                sendAttendanceNotification: jest.fn(),
            },
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AttendanceService,
                {
                    provide: getRepositoryToken(Attendance),
                    useValue: mockAttendanceRepository,
                },
                mockEmployeeServiceProvider,
                mockEmailQueueServiceProvider,
            ],
        }).compile();

        service = module.get<AttendanceService>(AttendanceService);
        attendanceRepository = module.get(getRepositoryToken(Attendance));
        employeeService = module.get(EmployeeService);
        emailQueueService = module.get(EmailQueueService);
    });

    describe('checkIn', () => {
        it('should create new attendance record and send notification', async () => {
            const mockNewAttendance = {
                ...mockAttendance,
                id: '123e4567-e89b-12d3-a456-426614174002',
                checkInTime: new Date()
            };

            employeeService.getEmployeeById.mockResolvedValue(mockEmployee);
            attendanceRepository.create.mockReturnValue(mockNewAttendance);
            attendanceRepository.save.mockResolvedValue(mockNewAttendance);

            const result = await service.checkIn({ employeeId: mockEmployee.id });

            expect(employeeService.getEmployeeById).toHaveBeenCalledWith(mockEmployee.id);
            expect(attendanceRepository.create).toHaveBeenCalledWith({ employee: mockEmployee });
            expect(attendanceRepository.save).toHaveBeenCalledWith(mockNewAttendance);
            expect(emailQueueService.sendAttendanceNotification).toHaveBeenCalledWith(
                mockEmployee,
                'check-in',
                mockNewAttendance.checkInTime
            );
            expect(result).toEqual(mockNewAttendance);
        });
    });

    describe('checkOut', () => {
        const mockCheckOutTime = new Date('2024-01-01T17:00:00Z');
        const mockAttendanceWithCheckOut: Attendance = {
            ...mockAttendance,
            checkOutTime: mockCheckOutTime
        };

        beforeEach(() => {
            jest.useFakeTimers().setSystemTime(mockCheckOutTime);
        });

        it('should update attendance record with check-out time and send notification', async () => {
            attendanceRepository.findOne.mockResolvedValue(mockAttendance);
            attendanceRepository.save.mockResolvedValue(mockAttendanceWithCheckOut);

            const result = await service.checkOut({ employeeId: mockEmployee.id });

            expect(attendanceRepository.findOne).toHaveBeenCalledWith({
                where: { employee: { id: mockEmployee.id }, checkOutTime: null }
            });
            expect(attendanceRepository.save).toHaveBeenCalledWith({
                ...mockAttendance,
                checkOutTime: mockCheckOutTime
            });
            expect(emailQueueService.sendAttendanceNotification).toHaveBeenCalledWith(
                mockEmployee,
                'check-out',
                mockCheckOutTime
            );
            expect(result).toEqual(mockAttendanceWithCheckOut);
        });
    });

    describe('getEmployeeAttendanceData', () => {
        const mockAttendanceRecords: Attendance[] = [
            {
                id: '123e4567-e89b-12d3-a456-426614174003',
                employee: mockEmployee,
                checkInTime: new Date('2024-01-01T09:00:00Z'),
                checkOutTime: new Date('2024-01-01T17:00:00Z')
            },
            {
                id: '123e4567-e89b-12d3-a456-426614174004',
                employee: mockEmployee,
                checkInTime: new Date('2024-01-02T09:00:00Z'),
                checkOutTime: new Date('2024-01-02T17:00:00Z')
            }
        ];

        it('should return employee attendance data', async () => {
            const employeeWithRecords = {
                ...mockEmployee,
                attendanceRecords: mockAttendanceRecords
            };

            employeeService.getEmployeeById.mockResolvedValue(employeeWithRecords);
            attendanceRepository.find.mockResolvedValue(mockAttendanceRecords);

            const result = await service.getEmployeeAttendanceData(mockEmployee.id);

            expect(employeeService.getEmployeeById).toHaveBeenCalledWith(mockEmployee.id);
            expect(attendanceRepository.find).toHaveBeenCalledWith({
                where: { employee: { id: mockEmployee.id } },
                order: { checkInTime: 'ASC' }
            });
            expect(result).toEqual({
                attendanceData: mockAttendanceRecords,
                employee: employeeWithRecords
            });
        });
    });
});