import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UsermainService } from './serive/usermain.service';
import { EmailService } from './serive/email.service';

@Module({
  controllers: [UserController ],
  providers: [ UsermainService, EmailService]
})
export class UserModule {}
