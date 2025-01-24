import { Controller, ForbiddenException } from '@nestjs/common';
import { FriendshipService } from './friendship.service';

@Controller('friendship')
export class FriendshipController {

    constructor(private friendshipService: FriendshipService) {}

    async use(req: any, res: any, next: () => void) {
      const { senderId, receiverId } = req.body;
  
      if (!(await this.friendshipService.isFriend(senderId, receiverId))) {
        throw new ForbiddenException('You can only chat with your friends.');
      }
  
      next();
    }
}
// i am back a