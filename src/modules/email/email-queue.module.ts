import { Module } from '@nestjs/common';
import { EmailQueueService } from './services/email-queue.service';
import { BullModule } from '@nestjs/bull';
import { OpenAiModule } from 'openai/openai.module';

@Module({
    imports: [
        BullModule.registerQueue({
            name: 'email',
        }),
        OpenAiModule,
    ],
    providers: [EmailQueueService],
    exports: [EmailQueueService],
})
export class EmailQueueModule { }
