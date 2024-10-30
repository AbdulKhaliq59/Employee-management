// attendance.controller.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from '../services/attendance.service';
import { CheckInDto } from '../dto/check-in.dto';
import { CheckOutDto } from '../dto/check-out.dto';
import { Response } from 'express';
import { Employee } from '../../employees/entity/employee.entity';

describe('AttendanceController', () => {
    let controller: AttendanceController;
    let service: AttendanceService;

    const mockEmployee: Employee = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'John Doe',
        email: 'john@example.com',
        employeeIdentifier: 'EMP001',
        phoneNumber: '+1234567890',
        attendanceRecords: [],
    };

    const mockAttendanceService = {
        checkIn: jest.fn(),
        checkOut: jest.fn(),
        getEmployeeAttendanceData: jest.fn(),
        generateReport: jest.fn(),
        generateExcelReport: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AttendanceController],
            providers: [
                {
                    provide: AttendanceService,
                    useValue: mockAttendanceService,
                },
            ],
        }).compile();

        controller = module.get<AttendanceController>(AttendanceController);
        service = module.get<AttendanceService>(AttendanceService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('checkIn', () => {
        it('should check in an employee', async () => {
            const checkInDto: CheckInDto = { employeeId: mockEmployee.id };
            mockAttendanceService.checkIn.mockResolvedValue({ message: 'Checked in successfully' });

            const result = await controller.checkIn(checkInDto);

            expect(service.checkIn).toHaveBeenCalledWith(checkInDto);
            expect(result).toEqual({ message: 'Checked in successfully' });
        });
    });

    describe('checkOut', () => {
        it('should check out an employee', async () => {
            const checkOutDto: CheckOutDto = { employeeId: mockEmployee.id };
            mockAttendanceService.checkOut.mockResolvedValue({ message: 'Checked out successfully' });

            const result = await controller.checkOut(checkOutDto);

            expect(service.checkOut).toHaveBeenCalledWith(checkOutDto);
            expect(result).toEqual({ message: 'Checked out successfully' });
        });
    });

    describe('getPdfReport', () => {
        it('should return a PDF report for the employee', async () => {
            const mockPdfBuffer = Buffer.from('PDF data');
            const res = { set: jest.fn(), send: jest.fn() } as unknown as Response;

            mockAttendanceService.getEmployeeAttendanceData.mockResolvedValue({
                attendanceData: [],
                employee: mockEmployee,
            });
            mockAttendanceService.generateReport.mockResolvedValue(mockPdfBuffer);

            await controller.getPdfReport(mockEmployee.id, res);

            expect(service.getEmployeeAttendanceData).toHaveBeenCalledWith(mockEmployee.id);
            expect(service.generateReport).toHaveBeenCalledWith([], mockEmployee);
            expect(res.set).toHaveBeenCalledWith({
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename=Attendance_Report_${mockEmployee.name}.pdf`,
                'Content-Length': mockPdfBuffer.length,
            });
            expect(res.send).toHaveBeenCalledWith(mockPdfBuffer);
        });
    });

    describe('getExcelReport', () => {
        it('should return an Excel report for the employee', async () => {
            const mockExcelBuffer = Buffer.from('Excel data');
            const res = { set: jest.fn(), send: jest.fn() } as unknown as Response;

            mockAttendanceService.getEmployeeAttendanceData.mockResolvedValue({
                attendanceData: [],
                employee: mockEmployee,
            });
            mockAttendanceService.generateExcelReport.mockResolvedValue(mockExcelBuffer);

            await controller.getExcelReport(mockEmployee.id, res);

            expect(service.getEmployeeAttendanceData).toHaveBeenCalledWith(mockEmployee.id);
            expect(service.generateExcelReport).toHaveBeenCalledWith([], mockEmployee);
            expect(res.set).toHaveBeenCalledWith({
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': `attachment; filename=Attendance_Report_${mockEmployee.name}.xlsx`,
                'Content-Length': mockExcelBuffer.length,
            });
            expect(res.send).toHaveBeenCalledWith(mockExcelBuffer);
        });
    });
});
