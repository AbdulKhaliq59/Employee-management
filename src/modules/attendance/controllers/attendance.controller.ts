import { Body, Controller, Get, Param, Post, Res } from "@nestjs/common";
import { AttendanceService } from "../services/attendance.service";
import { CheckInDto } from "../dto/check-in.dto";
import { CheckOutDto } from "../dto/check-out.dto";
import { Response } from 'express';

@Controller('attendance')
export class AttendanceController {
    constructor(private attendanceService: AttendanceService) { }

    @Post('check-in')
    async checkIn(@Body() checkInDto: CheckInDto) {
        console.log('IN', checkInDto);
        return await this.attendanceService.checkIn(checkInDto);
    }

    @Post('check-out')
    async checkOut(@Body() checkOutDto: CheckOutDto) {
        return await this.attendanceService.checkOut(checkOutDto);
    }

    @Get(':employeeId/report/pdf')
    async getPdfReport(@Param('employeeId') employeeId: string, @Res() res: Response) {
        const { attendanceData, employee } = await this.attendanceService.getEmployeeAttendanceData(employeeId);
        const pdfBuffer = await this.attendanceService.generateReport(attendanceData, employee);

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename=Attendance_Report_${employee.name}.pdf`,
            'Content-Length': pdfBuffer.length,
        });
        res.send(pdfBuffer); // Use send for the buffer
    }

    @Get(':employeeId/report/excel')
    async getExcelReport(@Param('employeeId') employeeId: string, @Res() res: Response) {
        const { attendanceData, employee } = await this.attendanceService.getEmployeeAttendanceData(employeeId);
        const excelBuffer = await this.attendanceService.generateExcelReport(attendanceData, employee);

        res.set({
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': `attachment; filename=Attendance_Report_${employee.name}.xlsx`,
            'Content-Length': excelBuffer.length,
        });
        res.send(excelBuffer); // Use send for the buffer
    }
}
