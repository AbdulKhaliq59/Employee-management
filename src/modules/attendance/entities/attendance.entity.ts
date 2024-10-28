import { Employee } from "@modules/employees/entity/employee.entity";
import { CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Attendance {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Employee, (employee) => employee.attendanceRecords, { eager: true })
    employee: Employee;

    @CreateDateColumn()
    checkInTime: Date;

    @UpdateDateColumn({ nullable: true })
    checkOutTime: Date;
}