import { Injectable } from '@nestjs/common';
import { PrismaClient, MessageStatus } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class ChatService {

  async createConversation(user1Id: string, user2Id: string) {
    return prisma.conversation.create({
      data: {
        user1Id,
        user2Id,
      },
    });
  }
  
  async sendMessage(senderId: string, receiverId: string, content: string, conversationId: string) {

   
  
    return prisma.message.create({
      data: {
        content,
        senderId,
        receiverId,
        conversationId,
        createdAt: new Date(),
        seen: false,
        status: MessageStatus.SENT, 
      },
    });
  }

  async getMessagesInConversation(conversationId: string, skip: number, take: number) {
    return prisma.message.findMany({
      where: {
        conversationId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take,
    });
  }



  async markMessagesAsSeen(conversationId: string, senderId: string) {
    return prisma.message.updateMany({
      where: {
        conversationId,
        senderId,
        seen: false,
      },
      data: {
        seen: true,
        status: MessageStatus.SEEN,
      },
    });
  }

  async markMessageAsDelivered(messageId: string) {
    return prisma.message.update({
      where: { id: messageId },
      data: { status: MessageStatus.DELIVERED },
    });
  }

  async setUserOnlineStatus(userId: string, isOnline: boolean) {
    return prisma.user.update({
      where: { id: userId },
      data: { isOnline },
    });
  }


  async updateMessageStatus(messageId: string, status: MessageStatus) {
    return prisma.message.update({
      where: { id: messageId },
      data: { status },
    });
  }
}
