import { Test, TestingModule } from '@nestjs/testing';
import { EmailProcessor } from './email.processor';
import { Job } from 'bull';

describe('EmailProcessor', () => {
    let emailProcessor: EmailProcessor;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [EmailProcessor],
        }).compile();

        emailProcessor = module.get<EmailProcessor>(EmailProcessor);
    });

    it('should be defined', () => {
        expect(emailProcessor).toBeDefined();
    });

    describe('handleEmailJob', () => {
        it('should handle an email job', async () => {
            const jobData = { to: 'test@example.com', subject: 'Test Email', content: 'This is a test email.' };
            const jobMock = { data: jobData } as Job; // Mocked job object

            // Spy on the console.log to verify output
            const consoleSpy = jest.spyOn(console, 'log');

            // Call the method
            await emailProcessor.handleEmailJob(jobMock);

            // Check if console.log was called with expected data
            expect(consoleSpy).toHaveBeenCalledWith('Processing email job', jobData);

            // Cleanup the spy
            consoleSpy.mockRestore();
        });
    });
});
