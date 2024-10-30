import { Test, TestingModule } from '@nestjs/testing';
import { EmailQueueService } from './email-queue.service';
import { getQueueToken } from '@nestjs/bull';
import { OpenAiService } from '../../../openai/services/openai.service';
import { Employee } from '../../employees/entity/employee.entity';

describe('EmailQueueService', () => {
    let service: EmailQueueService;
    let mockEmailQueue;
    let mockOpenAiService;

    const mockEmployee: Employee = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'John Doe',
        email: 'john@example.com',
        employeeIdentifier: 'EMP001',
        phoneNumber: '+1234567890',
        attendanceRecords: []
    };

    beforeEach(async () => {
        // Create mock implementations
        mockEmailQueue = {
            add: jest.fn().mockResolvedValue(undefined),
        };

        mockOpenAiService = {
            generateAttendanceMessage: jest.fn().mockResolvedValue('Generated message content'),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                EmailQueueService,
                {
                    provide: getQueueToken('email'),
                    useValue: mockEmailQueue,
                },
                {
                    provide: OpenAiService,
                    useValue: mockOpenAiService,
                },
            ],
        }).compile();

        service = module.get<EmailQueueService>(EmailQueueService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('sendAttendanceNotification', () => {
        const mockTime = new Date('2024-01-01T09:00:00');

        it('should successfully queue an email for check-in', async () => {
            await service.sendAttendanceNotification(mockEmployee, 'check-in', mockTime);

            // Verify OpenAI service was called with correct parameters
            expect(mockOpenAiService.generateAttendanceMessage).toHaveBeenCalledWith(
                mockEmployee,
                'check-in',
                mockTime
            );

            // Verify email was queued with correct parameters
            expect(mockEmailQueue.add).toHaveBeenCalledWith(
                'sendAttendanceEmail',
                {
                    to: mockEmployee.email,
                    subject: 'Attendance check-in Notification',
                    text: 'Generated message content',
                }
            );
        });

        it('should successfully queue an email for check-out', async () => {
            await service.sendAttendanceNotification(mockEmployee, 'check-out', mockTime);

            expect(mockOpenAiService.generateAttendanceMessage).toHaveBeenCalledWith(
                mockEmployee,
                'check-out',
                mockTime
            );

            expect(mockEmailQueue.add).toHaveBeenCalledWith(
                'sendAttendanceEmail',
                {
                    to: mockEmployee.email,
                    subject: 'Attendance check-out Notification',
                    text: 'Generated message content',
                }
            );
        });

        it('should handle OpenAI service errors gracefully', async () => {
            // Mock OpenAI service to throw an error
            const error = new Error('OpenAI API Error');
            mockOpenAiService.generateAttendanceMessage.mockRejectedValue(error);

            // Spy on console.error
            const consoleSpy = jest.spyOn(console, 'error');

            await service.sendAttendanceNotification(mockEmployee, 'check-in', mockTime);

            // Verify error was logged
            expect(consoleSpy).toHaveBeenCalledWith('Failed to send attendance notification:', error);

            // Verify email was not queued
            expect(mockEmailQueue.add).not.toHaveBeenCalled();

            // Clean up spy
            consoleSpy.mockRestore();
        });

        it('should handle email queue errors gracefully', async () => {
            // Mock queue to throw an error
            const error = new Error('Queue Error');
            mockEmailQueue.add.mockRejectedValue(error);

            const consoleSpy = jest.spyOn(console, 'error');

            await service.sendAttendanceNotification(mockEmployee, 'check-in', mockTime);

            expect(consoleSpy).toHaveBeenCalledWith('Failed to send attendance notification:', error);

            consoleSpy.mockRestore();
        });
    });
});