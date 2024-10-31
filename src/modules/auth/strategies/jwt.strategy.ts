import { Injectable } from "@nestjs/common";
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from "@nestjs/typeorm";
import { ExtractJwt, Strategy } from 'passport-jwt'
import { Repository } from "typeorm";
import { User } from '../entities/user.entity';
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: process.env.JWT_SECRET || 'a3b9e3665972d8fe6566615471f1a64261acb749ff80d590697306e5f385c9b74ba83267c6486823d3b674b615c01ee44b809e50e0edeb16b6266e67b6aefc95',
        });
    }
    async validate(payload: any) {
        return await this.usersRepository.findOne({ where: { id: payload.userId } })
    }
}