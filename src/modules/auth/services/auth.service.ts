import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';


@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        private jwtService: JwtService,
    ) { }

    async register(registerDto: RegisterDto): Promise<any> {
        const { name, email, password } = registerDto;

        // Check if the user already exists
        const existingUser = await this.usersRepository.findOne({ where: { email } });
        if (existingUser) {
            throw new UnauthorizedException('User already exists');
        }

        // Hash the password and save the user
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = this.usersRepository.create({ name, email, password: hashedPassword });
        await this.usersRepository.save(user);

        return { message: 'User registered successfully' };
    }

    async login(loginDto: LoginDto): Promise<any> {
        const { email, password } = loginDto;

        // Find user by email
        const user = await this.usersRepository.findOne({ where: { email } });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Create JWT token
        const payload = { userId: user.id, email: user.email };
        const accessToken = this.jwtService.sign(payload);
        return { accessToken };
    }

    async resetPassword(userId: string, newPassword: string): Promise<void> {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await this.usersRepository.update(userId, { password: hashedPassword });
    }
}
