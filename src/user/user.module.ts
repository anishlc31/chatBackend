import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UsermainService } from './serive/usermain.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports:[
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_LIFETIME },
    }),
  ],
  
  controllers: [UserController ],
  providers: [ UsermainService],
  exports:[UsermainService]
})
export class UserModule {}
