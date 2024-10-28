import { Body, Controller, Post } from "@nestjs/common";
import { AttendanceService } from "../services/attendance.service";
import { CheckInDto } from "../dto/check-in.dto";
import { CheckOutDto } from "../dto/check-out.dto";

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
}