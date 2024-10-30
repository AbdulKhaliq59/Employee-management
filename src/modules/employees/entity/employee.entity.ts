import { Attendance } from "../../attendance/entities/attendance.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";


@Entity()
export class Employee {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ unique: true })
    email: string;

    @Column({ unique: true })
    employeeIdentifier: string;

    @Column()
    phoneNumber: string;

    @OneToMany(() => Attendance, (attendance) => attendance.employee)
    attendanceRecords: Attendance[]
}