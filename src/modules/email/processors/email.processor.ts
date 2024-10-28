import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';

@Processor('email')
export class EmailProcessor {
    @Process()
    async handleEmailJob(job: Job) {
        console.log('Processing email job', job.data);
        // Implement your email sending logic here
    }
}
