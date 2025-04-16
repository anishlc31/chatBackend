import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';

import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { JwtAuthGuard } from './auth/guards/jwt.guards';
import { APP_GUARD } from '@nestjs/core';
import { ChatModule } from './chat/chat.module';
import { FriendshipModule } from './friendship/friendship.module';



@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }),

  AuthModule,

  ChatModule,

  FriendshipModule,],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {

}

// let start and finish with first month of 2082

