import { Body, Controller, Post, Req } from '@nestjs/common';
import { ForFriendService } from './for-friend.service';

@Controller('for-friend')
export class ForFriendController {

    constructor(private forFriend : ForFriendService) {}

    @Post('/send-friend-request')
    async sendFriendRequest(@Body('userId') userId: string, @Req() req: Request) {
        const requesterId = req.user['id']; // Assuming you have JWT auth and user ID in token
        return this.forFriend.sendFriendRequest(requesterId, userId);
    }

    @Post('/respond-friend-request')
    async respondToFriendRequest(@Body() { friendshipId, status }: { friendshipId: string, status: string }) {
        return this.forFriend.respondToFriendRequest(friendshipId, status);
    }

    @Get('/friends')
    async getFriends(@Req() req: Request) {
        const userId = req.user['id'];
        return this.forFriend.getFriends(userId);
    }

}
