import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthMiddleware } from './milddlerware/auth.middleware';

@Module({
  imports: [UserModule, AuthModule,
   // MongooseModule.forRoot('mongodb://localhost/nest'), // Change this to your MongoDB connection string

  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .exclude(
        { path: '/api/users', method: RequestMethod.POST},
        {path: '/api/users/login', method: RequestMethod.POST}
      )
      .forRoutes('')
  }
}
