import { Module } from '@nestjs/common';
import { ForFriendService } from './for-friend.service';
import { ForFriendController } from './for-friend.controller';

@Module({
  providers: [ForFriendService],
  controllers: [ForFriendController]
})
export class ForFriendModule {}
