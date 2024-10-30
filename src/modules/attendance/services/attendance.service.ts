import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attendance } from '../entities/attendance.entity';
import { EmployeeService } from '../../employees/services/employee.service';
import { CheckInDto } from '../dto/check-in.dto';
import { CheckOutDto } from '../dto/check-out.dto';
import { EmailQueueService } from '../../email/services/email-queue.service';
import { Employee } from '../../../modules/employees/entity/employee.entity';
import * as PDFDocument from 'pdfkit';
import * as ExcelJS from 'exceljs';
import { Buffer } from 'node:buffer';

@Injectable()
export class AttendanceService {
    constructor(
        @InjectRepository(Attendance) private attendanceRepository: Repository<Attendance>,
        private employeeService: EmployeeService,
        private emailQueueService: EmailQueueService,  // Injected email queue service
    ) { }

    async checkIn({ employeeId }: CheckInDto): Promise<Attendance> {
        const employee = await this.employeeService.getEmployeeById(employeeId);
        console.log("");

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

    async getEmployeeAttendanceData(employeeId: string) {
        const employee = await this.employeeService.getEmployeeById(employeeId);
        if (!employee) throw new NotFoundException(`Employee with ID ${employeeId} not found`);

        const attendanceData = await this.attendanceRepository.find({
            where: { employee: { id: employeeId } },
            order: { checkInTime: 'ASC' },
        });

        return { attendanceData, employee };
    }

    async generateReport(attendanceData: Attendance[], employee: Employee): Promise<Buffer> {
        const doc = new PDFDocument();
        const buffers: Uint8Array[] = [];

        doc.on('data', (chunk) => buffers.push(chunk));
        doc.on('end', () => { });

        doc.fontSize(20).text(`Attendance Report for ${employee.name}`, { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).font('Helvetica-Bold').text('Date', 100, doc.y, { width: 200 });
        doc.text('Check-In Time', 250, doc.y, { width: 200 });
        doc.text('Check-Out Time', 400, doc.y, { width: 200 });
        doc.moveDown();

        attendanceData.forEach(record => {
            doc.font('Helvetica').text(record.checkInTime.toLocaleDateString(), 100);
            doc.text(record.checkInTime.toLocaleTimeString(), 250);
            doc.text(record.checkOutTime ? record.checkOutTime.toLocaleTimeString() : 'N/A', 400);
            doc.moveDown();
        });

        doc.end();

        return new Promise((resolve) => {
            doc.on('end', () => {
                resolve(Buffer.concat(buffers));
            });
        });
    }

    async generateExcelReport(attendanceData: Attendance[], employee: Employee): Promise<Buffer> {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Attendance Report');

        worksheet.mergeCells('A1:C1');
        worksheet.getCell('A1').value = `Attendance Report for ${employee.name}`;
        worksheet.getCell('A1').font = { size: 14, bold: true };
        worksheet.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };

        worksheet.columns = [
            { header: 'Date', key: 'date', width: 15 },
            { header: 'Check-In Time', key: 'checkInTime', width: 20 },
            { header: 'Check-Out Time', key: 'checkOutTime', width: 20 },
        ];

        attendanceData.forEach(record => {
            worksheet.addRow({
                date: record.checkInTime.toLocaleDateString(),
                checkInTime: record.checkInTime.toLocaleTimeString(),
                checkOutTime: record.checkOutTime ? record.checkOutTime.toLocaleTimeString() : 'N/A',
            });
        });

        const buffer = await workbook.xlsx.writeBuffer();
        return Buffer.from(buffer);
    }
}
