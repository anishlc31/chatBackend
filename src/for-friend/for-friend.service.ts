import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

@Injectable()
export class ForFriendService {
  

    async sendFriendRequest(requesterId: string, userId: string) {
        // Check if a friendship already exists
        const existingFriendship = await prisma.friendship.findFirst({
            where: {
                OR: [
                    { user1Id: requesterId, user2Id: userId },
                    { user1Id: userId, user2Id: requesterId }
                ]
            }
        });

        if (existingFriendship) {
            throw new ForbiddenException('Friend request already sent or you are already friends');
        }

        // Create a new friendship request
        return await prisma.friendship.create({
            data: {
                user1Id: requesterId,
                user2Id: userId,
                status: 'PENDING'
            }
        });
    }

    async respondToFriendRequest(friendshipId: string, status: string) {
        // Update the status of the friendship request
        return await prisma.friendship.update({
            where: { id: friendshipId },
            data: { status }
        });
    }

    async getFriends(userId: string) {
        // Fetch all friends where status is ACCEPTED
        return await prisma.friendship.findMany({
            where: {
                OR: [
                    { user1Id: userId, status: 'ACCEPTED' },
                    { user2Id: userId, status: 'ACCEPTED' }
                ]
            },
            include: {
                user1: true,
                user2: true
            }
        });
    }
}



