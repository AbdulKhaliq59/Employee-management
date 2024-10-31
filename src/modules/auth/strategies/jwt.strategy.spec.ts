import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy } from './jwt.strategy';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';

dotenv.config(); // Load environment variables for JWT_SECRET

describe('JwtStrategy', () => {
    let jwtStrategy: JwtStrategy;
    let usersRepository: Repository<User>;

    const mockUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashedPassword123',
    };

    const mockUsersRepository = {
        findOne: jest.fn().mockResolvedValue(mockUser),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                JwtStrategy,
                {
                    provide: getRepositoryToken(User),
                    useValue: mockUsersRepository,
                },
            ],
        }).compile();

        jwtStrategy = module.get<JwtStrategy>(JwtStrategy);
        usersRepository = module.get<Repository<User>>(getRepositoryToken(User));
    });

    it('should be defined', () => {
        expect(jwtStrategy).toBeDefined();
    });

    describe('validate', () => {
        it('should validate and return the user based on JWT payload', async () => {
            const payload = { userId: mockUser.id };

            const result = await jwtStrategy.validate(payload);

            expect(usersRepository.findOne).toHaveBeenCalledWith({ where: { id: payload.userId } });
            expect(result).toEqual(mockUser);
        });

        it('should return null if user is not found', async () => {
            mockUsersRepository.findOne.mockResolvedValueOnce(null);

            const payload = { userId: 'non-existing-id' };
            const result = await jwtStrategy.validate(payload);

            expect(usersRepository.findOne).toHaveBeenCalledWith({ where: { id: payload.userId } });
            expect(result).toBeNull();
        });
    });
});
