import { Employee } from '../../employees/entity/employee.entity';
import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { OpenAiService } from '../../../openai/services/openai.service';

@Injectable()
export class EmailQueueService {
    constructor(
        @InjectQueue('email') private emailQueue: Queue,
        private openaiService: OpenAiService,
    ) { }

    async sendAttendanceNotification(employee: Employee, type: 'check-in' | 'check-out', time: Date): Promise<void> {
        try {
            const messageContent = await this.openaiService.generateAttendanceMessage(employee, type, time);

            await this.emailQueue.add('sendAttendanceEmail', {
                to: employee.email,
                subject: `Attendance ${type} Notification`,
                text: messageContent,
            });
        } catch (error) {
            console.error('Failed to send attendance notification:', error);
            // Optionally: Handle the error (e.g., logging, retry logic, etc.)
        }
    }

}
