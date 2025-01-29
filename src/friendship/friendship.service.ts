import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { UpdateFriendshipStatusDto } from 'src/auth/dto/friend.dto';
import { FriendshipGateway } from './friendship.gateway';


const prisma = new PrismaClient();
import { Socket } from 'ngx-socket-io';

@Injectable()
export class FriendshipService {
    constructor(private readonly friendshipGateway: FriendshipGateway) {}

    async sendFriendRequest(requesterId: string, recipientId: string) {
      if (requesterId === recipientId) {
        throw new ForbiddenException('You cannot send a friend request to yourself.');
      }
    
      // Check if a friend request already exists
      const existingRequest = await prisma.friendship.findUnique({
        where: { requesterId_recipientId: { requesterId, recipientId } },
      });
    
      if (existingRequest) {
        if (existingRequest.status === 'PENDING') {
          throw new ForbiddenException('Friend request already sent.');
        }
        
        if (existingRequest.status === 'ACCEPTED') {
          throw new ForbiddenException('You are already friends.');
        }
    
        if (existingRequest.status === 'REJECTED') {
          // If the previous request was rejected, allow sending a new request by updating status
          return await prisma.friendship.update({
            where: { id: existingRequest.id },
            data: { status: 'PENDING' }, // Reset the status to PENDING
          });
        }
      }
    
      // Create a new friend request if no existing request
      const friendship = await prisma.friendship.create({
        data: {
          requesterId,
          recipientId,
          status: 'PENDING', // Ensure new requests are set to pending
        },
      });
    
      // Trigger notification count update
      this.friendshipGateway.handleFriendRequest(requesterId, recipientId);
    
      return friendship;
    }
    

    async updateFriendshipStatus(userId: string, updateDto: UpdateFriendshipStatusDto) {
      const { requesterId, recipientId, status } = updateDto;
  
      // Validate if the userId matches either requesterId or recipientId
      if (userId !== requesterId && userId !== recipientId) {
          throw new ForbiddenException('You are not authorized to update this friendship.');
      }
  
      const friendship = await prisma.friendship.findUnique({
          where: {
              requesterId_recipientId: { requesterId, recipientId },
          },
      });
  
      if (friendship) {
          // If the friendship exists, update the status
          return prisma.friendship.update({
              where: { requesterId_recipientId: { requesterId, recipientId } },
              data: { status },
          });
      } else {
          // If the friendship doesn't exist, create a new friendship
          return prisma.friendship.create({
              data: {
                  requesterId,
                  recipientId,
                  status,
              },
          });
      }
  }
  
  
    async getFriendList(userId: string) {
        return prisma.friendship.findMany({
            where: {
                OR: [
                    { requesterId: userId, status: 'ACCEPTED' },
                    { recipientId: userId, status: 'ACCEPTED' },
                ],
            },
            include: {
                requester: { select: { id: true, username: true, email: true } },
                recipient: { select: { id: true, username: true, email: true } },
            },
        });
    }

    async getPendingRequests(userId: string) {
        const res = prisma.friendship.findMany({
            where: {
                recipientId: userId,
                status: 'PENDING',
            },
            include: {
                requester: { select: { id: true, username: true, email: true } },
            },
        
        });
        console.log("hello"+res);
        return res
    }


    async getExcludedUserIds(userId: string): Promise<string[]> {
        const friendships = await prisma.friendship.findMany({
            where: {
                OR: [
                    { requesterId: userId },
                    { recipientId: userId },
                ],
            },
            select: {
                requesterId: true,
                recipientId: true,
                status: true,
            },
        });
    
        const excludedIds = new Set<string>();
        friendships.forEach(friendship => {
            if (friendship.status === 'ACCEPTED' || friendship.status === 'PENDING') {
                excludedIds.add(friendship.requesterId);
                excludedIds.add(friendship.recipientId);
            }
        });
    
        // Remove the current user's ID
        excludedIds.delete(userId);
    
        return Array.from(excludedIds);
    }

    async getNotificationCount(userId: string): Promise<number> {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { friendRequestNotifacation: true },
        });
    
        if (!user) {
          throw new NotFoundException('User not found');
        }
    
        return user.friendRequestNotifacation;
      }


 
    
}
