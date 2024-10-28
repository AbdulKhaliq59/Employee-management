import { Module } from '@nestjs/common';
import { EmailQueueService } from './services/email-queue.service';
import { BullModule } from '@nestjs/bull';
import { OpenAiModule } from 'openai/openai.module';

@Module({
    imports: [
        BullModule.registerQueue({
            name: 'email',
            // The processor can be defined in a separate file or inline
            // If you have a specific processor file, include it in the processors folder.
        }),
        OpenAiModule, // Import the OpenAiModule here
    ],
    providers: [EmailQueueService],
    exports: [EmailQueueService], // Export EmailQueueService if used in other modules
})
export class EmailQueueModule { }
