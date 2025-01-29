import { Module } from '@nestjs/common';
import { FriendshipService } from './friendship.service';
import { FriendshipController } from './friendship.controller';
import { FriendshipGateway } from './friendship.gateway';


@Module({
  providers: [FriendshipService, FriendshipGateway],
  controllers: [FriendshipController]
})
export class FriendshipModule {}
