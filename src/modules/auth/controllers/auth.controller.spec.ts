import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from '../services/auth.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';

describe('AuthController', () => {
    let controller: AuthController;
    let service: AuthService;

    const mockRegisterDto: RegisterDto = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
    };

    const mockLoginDto: LoginDto = {
        email: 'john@example.com',
        password: 'password123'
    };

    const mockResetPasswordDto: ResetPasswordDto = {
        newPassword: 'newPassword123'
    };

    const mockAuthService = {
        register: jest.fn(),
        login: jest.fn(),
        resetPassword: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                {
                    provide: AuthService,
                    useValue: mockAuthService,
                },
            ],
        }).compile();

        controller = module.get<AuthController>(AuthController);
        service = module.get<AuthService>(AuthService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('register', () => {
        it('should register a new user', async () => {
            const expectedResult = { message: 'User registered successfully' };
            mockAuthService.register.mockResolvedValue(expectedResult);

            const result = await controller.register(mockRegisterDto);

            expect(service.register).toHaveBeenCalledWith(mockRegisterDto);
            expect(result).toEqual(expectedResult);
        });
    });

    describe('login', () => {
        it('should login user and return access token', async () => {
            const expectedResult = { accessToken: 'mockJwtToken' };
            mockAuthService.login.mockResolvedValue(expectedResult);

            const result = await controller.login(mockLoginDto);

            expect(service.login).toHaveBeenCalledWith(mockLoginDto);
            expect(result).toEqual(expectedResult);
        });
    });

    describe('resetPassword', () => {
        it('should reset user password', async () => {
            const mockRequest = {
                user: { id: '123' }
            };

            await controller.resetPassword(mockRequest, mockResetPasswordDto);

            expect(service.resetPassword).toHaveBeenCalledWith(
                mockRequest.user.id,
                mockResetPasswordDto.newPassword
            );
        });
    });
});