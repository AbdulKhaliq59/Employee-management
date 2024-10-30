import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { AuthService } from './auth.service';
import { User } from '../entities/user.entity';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
    let service: AuthService;
    let repository: Repository<User>;
    let jwtService: JwtService;

    const mockUser: User = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashedPassword123'
    };

    const mockRegisterDto: RegisterDto = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
    };

    const mockLoginDto: LoginDto = {
        email: 'john@example.com',
        password: 'password123'
    };

    const mockRepository = {
        findOne: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
        update: jest.fn(),
    };

    const mockJwtService = {
        sign: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: getRepositoryToken(User),
                    useValue: mockRepository,
                },
                {
                    provide: JwtService,
                    useValue: mockJwtService,
                },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
        repository = module.get<Repository<User>>(getRepositoryToken(User));
        jwtService = module.get<JwtService>(JwtService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('register', () => {
        it('should successfully register a new user', async () => {
            mockRepository.findOne.mockResolvedValue(null);
            mockRepository.create.mockReturnValue(mockUser);
            mockRepository.save.mockResolvedValue(mockUser);
            (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword123');

            const result = await service.register(mockRegisterDto);

            expect(repository.findOne).toHaveBeenCalledWith({
                where: { email: mockRegisterDto.email },
            });
            expect(bcrypt.hash).toHaveBeenCalledWith(mockRegisterDto.password, 10);
            expect(repository.create).toHaveBeenCalled();
            expect(repository.save).toHaveBeenCalled();
            expect(result).toEqual({ message: 'User registered successfully' });
        });

        it('should throw UnauthorizedException if user already exists', async () => {
            mockRepository.findOne.mockResolvedValue(mockUser);

            await expect(service.register(mockRegisterDto)).rejects.toThrow(
                UnauthorizedException,
            );
        });
    });

    describe('login', () => {
        it('should successfully login and return access token', async () => {
            mockRepository.findOne.mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);
            mockJwtService.sign.mockReturnValue('mockJwtToken');

            const result = await service.login(mockLoginDto);

            expect(repository.findOne).toHaveBeenCalledWith({
                where: { email: mockLoginDto.email },
            });
            expect(bcrypt.compare).toHaveBeenCalledWith(
                mockLoginDto.password,
                mockUser.password,
            );
            expect(jwtService.sign).toHaveBeenCalledWith({
                userId: mockUser.id,
                email: mockUser.email,
            });
            expect(result).toEqual({ accessToken: 'mockJwtToken' });
        });

        it('should throw UnauthorizedException if user not found', async () => {
            mockRepository.findOne.mockResolvedValue(null);

            await expect(service.login(mockLoginDto)).rejects.toThrow(
                UnauthorizedException,
            );
        });

        it('should throw UnauthorizedException if password is invalid', async () => {
            mockRepository.findOne.mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            await expect(service.login(mockLoginDto)).rejects.toThrow(
                UnauthorizedException,
            );
        });
    });

    describe('resetPassword', () => {
        it('should successfully reset password', async () => {
            const userId = '123';
            const newPassword = 'newPassword123';
            const hashedPassword = 'newHashedPassword123';

            (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
            mockRepository.update.mockResolvedValue({ affected: 1 });

            await service.resetPassword(userId, newPassword);

            expect(bcrypt.hash).toHaveBeenCalledWith(newPassword, 10);
            expect(repository.update).toHaveBeenCalledWith(userId, {
                password: hashedPassword,
            });
        });
    });
});