import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class ChatService {
  
  async sendMessage(senderId: string, receiverId: string, content: string) {
    return prisma.message.create({
      data: {
        content,
        senderId,
        receiverId,
        createdAt: new Date(),
          seen: false,
          status: 'sent', 

      },
    });
  }

  async getMessagesBetweenUsers(user1Id: string, user2Id: string, skip: number, take: number) {
    return prisma.message.findMany({
      where: {
        OR: [
          { senderId: user1Id, receiverId: user2Id },
          { senderId: user2Id, receiverId: user1Id },
        ],
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: skip,
      take: take,
    });
  }

  async markMessagesAsSeen(senderId: string, receiverId: string) {
    return prisma.message.updateMany({
      where: {
        senderId,
        receiverId,
        seen: false,
      },
      data: {
        seen: true,
        status:'seen'
      },
    });
 
  }



  async markMessageAsDelivered(messageId: string) {
    return prisma.message.update({
      where: { id: messageId },
      data: { status: 'delivered' },
    });
  }
  

}