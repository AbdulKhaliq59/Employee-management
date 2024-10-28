// src/attendance/services/attendance.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attendance } from '../entities/attendance.entity';
import { EmployeeService } from '@modules/employees/services/employee.service';
import { CheckInDto } from '../dto/check-in.dto';
import { CheckOutDto } from '../dto/check-out.dto';
import { EmailQueueService } from '../../email/services/email-queue.service';

@Injectable()
export class AttendanceService {
    constructor(
        @InjectRepository(Attendance) private attendanceRepository: Repository<Attendance>,
        private employeeService: EmployeeService,
        private emailQueueService: EmailQueueService,  // Injected email queue service
    ) { }

    async checkIn({ employeeId }: CheckInDto): Promise<Attendance> {
        const employee = await this.employeeService.getEmployeeById(employeeId);
        if (!employee) throw new NotFoundException(`Employee with ID ${employeeId} not found`);

        const attendance = this.attendanceRepository.create({ employee });
        await this.attendanceRepository.save(attendance);

        // Enqueue email notification
        await this.emailQueueService.sendAttendanceNotification(employee, 'check-in', attendance.checkInTime);

        return attendance;
    }

    async checkOut({ employeeId }: CheckOutDto): Promise<Attendance> {
        const attendance = await this.attendanceRepository.findOne({
            where: { employee: { id: employeeId }, checkOutTime: null },
        });
        if (!attendance) throw new NotFoundException(`No active attendance record for employee ID ${employeeId}`);

        attendance.checkOutTime = new Date();
        await this.attendanceRepository.save(attendance);

        // Enqueue email notification
        await this.emailQueueService.sendAttendanceNotification(attendance.employee, 'check-out', attendance.checkOutTime);

        return attendance;
    }
}
