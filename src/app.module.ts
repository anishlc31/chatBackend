import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';

import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { JwtAuthGuard } from './auth/guards/jwt.guards';
import { APP_GUARD } from '@nestjs/core';
import { ChatModule } from './chat/chat.module';



@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }),

  AuthModule,

  ChatModule],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {

}



