import { Injectable } from '@nestjs/common';
import { PrismaClient, MessageStatus } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class ChatService {
  
  async sendMessage(senderId: string, receiverId: string, content: string) {

    let conversation = await prisma.conversation.findFirst({
      where: {
        OR: [
          { user1Id: senderId, user2Id: receiverId },
          { user1Id: receiverId, user2Id: senderId },
        ],
      },
    });

    // If no conversation exists, create one
    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          user1Id: senderId,
          user2Id: receiverId,
          unseenMessageCountOfUser1: 0,
          unseenMessageCountOfUser2: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
    }


    
    const message =  prisma.message.create({
      data: {
        content,
        senderId,
        receiverId,
        createdAt: new Date(),
        seen: false,
        status: MessageStatus.SENT, 
        conversationId: conversation.id,

      },
    });

    if (conversation.user1Id === receiverId) {
      await prisma.conversation.update({
        where: { id: conversation.id },
        data: { unseenMessageCountOfUser1: { increment: 1 } },
      });
    } else if (conversation.user2Id === receiverId) {
      await prisma.conversation.update({
        where: { id: conversation.id },
        data: { unseenMessageCountOfUser2: { increment: 1 } },
      });
    }

    return message;
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
//making seen msg 
  async markMessagesAsSeen(senderId: string, receiverId: string) {
   const makeSeen =   prisma.message.updateMany({
      where: {
        senderId,
        receiverId,
        seen: false,
      },
      data: {
        seen: true,
        status: MessageStatus.SEEN,
      },
    });
    const conversation = await prisma.conversation.findFirst({
      where: {
        OR: [
          { user1Id: senderId, user2Id: receiverId },
          { user1Id: receiverId, user2Id: senderId },
        ],
      },
    });

    if (conversation) {
      if (conversation.user1Id === senderId) {
        await prisma.conversation.update({
          where: { id: conversation.id },
          data: { unseenMessageCountOfUser2: 0 },
        });
      } else if (conversation.user2Id === senderId) {
        await prisma.conversation.update({
          where: { id: conversation.id },
          data: { unseenMessageCountOfUser1: 0 },
        });
      }
    }

return makeSeen;
  }

  

  async getUnseenMessageCounts(userId: string) {
    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { user1Id: userId },
          { user2Id: userId },
        ],
      },
    });


//for unseen msg 
    const unseenMessageCounts = conversations.reduce((acc, conversation) => {
      if (conversation.user1Id === userId) {
        acc[conversation.user2Id] = conversation.unseenMessageCountOfUser1;
      } else {
        acc[conversation.user1Id] = conversation.unseenMessageCountOfUser2;
      }
      return acc;
    }, {});

    return unseenMessageCounts;
  }
  
}