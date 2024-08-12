import { AuthService } from './auth.service';
import { Body, Controller, HttpCode, HttpStatus, Post, Req, UseGuards, Request, Get, Query, Res } from '@nestjs/common';
import { loginDto, singupDto } from './dto';
import { Public } from './decorator/public.decorator';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}


    @Public()
    @Post('/signup')
    signup(@Body() dto: singupDto) {
        return this.authService.signup(dto);
    }

    @Public()
    @Post('/login')
    login(@Body() dto: loginDto) {
        return this.authService.login(dto);
    }

    @Get('/find-by-username')
    async findAllByUsername(@Query('username') username: string) {
        return this.authService.findAllByUsername(username);
    }

    // New endpoint to get all users
    @Get('/users')
    async getAllUsers() {
        return this.authService.getAllUsers();
    }
}
