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
  
    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          user1Id: senderId,
          user2Id: receiverId,
          updateChatAt: new Date(),
        },
      });
    }
  
    const message = await prisma.message.create({
      data: {
        content,
        senderId,
        receiverId,
        conversationId: conversation.id,
      },
    });
  
    // Update the updateChatAt field
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { updateChatAt: new Date() },
    });
  
    // Update unseen message counts
    if (conversation.user1Id === senderId) {
      await prisma.conversation.update({
        where: { id: conversation.id },
        data: { unseenMessageCountOfUser2: { increment: 1 } },
      });
    } else {
      await prisma.conversation.update({
        where: { id: conversation.id },
        data: { unseenMessageCountOfUser1: { increment: 1 } },
      });
    }
  
    return { message, conversation: await prisma.conversation.findUnique({ where: { id: conversation.id } }) };
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
  const messages = await prisma.message.updateMany({
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

  return {messages,conversation};
}

  
//unseen msg count 
  async getUnseenMessageCounts(userId: string) {
    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { user1Id: userId },
          { user2Id: userId },
        ],
      },
    });


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



  //for sorted 

  async getConversations(userId: string) {
    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { user1Id: userId },
          { user2Id: userId },
        ],
      },
      orderBy: {
        updateChatAt: 'desc', // Sort by updateChatAt in descending order
      },
    });

    return conversations;
  }


  //for deliver msg (not worked for now )
  
  async markMessageAsDelivered(messageId: string) {
    await prisma.message.update({
      where: { id: messageId },
      data: { status: MessageStatus.DELIVERED },
    });
  }

//of update list 
  async getConversation(user1Id: string, user2Id: string) {
    return prisma.conversation.findFirst({
      where: {
        OR: [
          { user1Id, user2Id },
          { user1Id: user2Id, user2Id: user1Id },
        ],
      },
    });
  }
  
}


