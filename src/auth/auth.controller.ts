import { AuthService } from './auth.service';
import { Body, Controller, HttpCode, HttpStatus, Post, Req, UseGuards,Request } from '@nestjs/common';
import { loginDto, singupDto } from './dto';
import { JwtAuthGuard } from './guards/jwt.guards';
import { GetCurrentUserId  } from './decorator/user.decorator';
import { Public } from './decorator/public.decorator';

@Controller('auth')
export class AuthController {


    constructor(private authService: AuthService) {}


    @Public()
    @Post ('/signup')
    signup(@Body() dto  : singupDto){
        return this.authService.signup(dto);
    }

    //login 
    @Public()
    @Post ('/login')
    login(@Body() dto  : loginDto){
        return this.authService.login(dto);

    }


    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard)
    @Post ('/logout')
    logout(@GetCurrentUserId() userId: string){
return this.authService.logout(userId)
        
    }
}
