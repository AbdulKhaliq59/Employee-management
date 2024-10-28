import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import configuration from './config/configuration';
import { EmployeeModule } from '@modules/employees/employee.module';
import { Employee } from '@modules/employees/entity/employee.entity';
import { Attendance } from '@modules/attendance/entities/attendance.entity';
import { AttendanceModule } from '@modules/attendance/attendance.module';
import { EmailQueueModule } from '@modules/email/email-queue.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [Employee, Attendance],
      autoLoadEntities: true,
      synchronize: true,
    }),
    AuthModule,
    EmployeeModule,
    AttendanceModule,
    EmailQueueModule
  ],
})
export class AppModule { }
