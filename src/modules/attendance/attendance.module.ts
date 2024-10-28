import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attendance } from './entities/attendance.entity';
import { AttendanceController } from './controllers/attendance.controller';
import { AttendanceService } from './services/attendance.service';
import { EmailQueueModule } from '../email/email-queue.module'; // Adjust path if needed
import { EmployeeModule } from '../employees/employee.module'; // Import EmployeeModule

@Module({
    imports: [
        TypeOrmModule.forFeature([Attendance]),
        EmailQueueModule, // Import EmailQueueModule
        EmployeeModule, // Import EmployeeModule to resolve EmployeeService dependency
    ],
    providers: [AttendanceService],
    controllers: [AttendanceController],
    exports: [AttendanceService],
})
export class AttendanceModule { }
