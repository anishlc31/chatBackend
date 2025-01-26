import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { UpdateFriendshipStatusDto } from 'src/auth/dto/friend.dto';

const prisma = new PrismaClient();

@Injectable()
export class FriendshipService {
    async sendFriendRequest(requesterId: string, recipientId: string) {
        if (requesterId === recipientId) {
            throw new ForbiddenException('You cannot send a friend request to yourself.');
        }

        const existingRequest = await prisma.friendship.findUnique({
            where: { requesterId_recipientId: { requesterId, recipientId } },
        });

        if (existingRequest) {
            throw new ForbiddenException('Friend request already sent.');
        }

        return prisma.friendship.create({
            data: {
                requesterId,
                recipientId,
            },
        });
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
        return prisma.friendship.findMany({
            where: {
                recipientId: userId,
                status: 'PENDING',
            },
            include: {
                requester: { select: { id: true, username: true, email: true } },
            },
        });
    }
}
