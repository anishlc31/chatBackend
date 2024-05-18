import { UsermainService } from './serive/usermain.service';
import { Body, Controller ,HttpCode,HttpStatus,Post} from '@nestjs/common';
import { singupDto } from './dto/user.dto';
import { loginDto } from './dto/login.dto';

@Controller('user')
export class UserController {

    constructor( private UsermainService : UsermainService){

    }

  @Post('singup')
  async create(@Body() singupDto: singupDto){

        return this.UsermainService.signup( singupDto);
}


@HttpCode(HttpStatus.OK)
@Post('login')
login(@Body() dto: loginDto) {
  return this.UsermainService.login(dto);
}




}
