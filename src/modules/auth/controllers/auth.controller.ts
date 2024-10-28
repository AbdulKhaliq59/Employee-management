import { Body, Controller, Post, UseGuards, Request } from "@nestjs/common";
import { AuthService } from "../services/auth.service";
import { RegisterDto } from "../dto/register.dto";
import { LoginDto } from "../dto/login.dto";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";
import { ResetPasswordDto } from "../dto/reset-password.dto";


@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }
    @Post('register')
    async register(@Body() registerDto: RegisterDto) {
        return this.authService.register(registerDto);
    }

    @Post('login')
    async login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    @UseGuards(JwtAuthGuard)
    @Post('reset-password')
    async resetPassword(@Request() req, @Body() resetPasswordDto: ResetPasswordDto) {
        return this.authService.resetPassword(req.user.id, resetPasswordDto.newPassword);
    }
}