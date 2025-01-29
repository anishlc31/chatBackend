import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { FriendshipService } from './friendship.service';
import { Request } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guards';
import { FriendRequestDto, UpdateFriendshipStatusDto } from 'src/auth/dto/friend.dto';

@Controller('friendship')
@UseGuards(JwtAuthGuard)
export class FriendshipController {
    constructor(private readonly friendshipService: FriendshipService) {}

    // Send a friend request
    @Post('request')
    async sendFriendRequest(@Body() friendRequestDto: FriendRequestDto, @Request() req: any) {
        const requesterId = req.user.sub;
        return this.friendshipService.sendFriendRequest(requesterId, friendRequestDto.recipientId);
    }

    // Update the friendship status (accept, reject, block)
    @Patch('update-status')
    async updateFriendshipStatus(@Body() updateDto: UpdateFriendshipStatusDto, @Request() req: any) {
        const userId = req.user.sub;

        return this.friendshipService.updateFriendshipStatus(userId, updateDto);
    }

    // Get friend list
    @Get('list')
    async getFriendList(@Request() req: any) {
        const userId = req.user.sub;
        return this.friendshipService.getFriendList(userId);
    }

    // Get pending friend requests
    @Get('pending-requests')
    async getPendingRequests(@Request() req: any) {
        const userId = req.user.sub;
        return this.friendshipService.getPendingRequests(userId);
    }

    @Get('excluded-users')
async getExcludedUserIds(@Request() req: any) {
    const userId = req.user.sub;
    return this.friendshipService.getExcludedUserIds(userId);
}



}

