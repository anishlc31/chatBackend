import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { IPaginationOptions } from 'nestjs-typeorm-paginate';

const prisma = new PrismaClient();


@Injectable()
export class ChatService {

    async sendMessage(senderId: string, receiverId: string, content: string) {
        return prisma.message.create({
          data: {
            content,
            senderId,
            receiverId,
          },
        });
      }


      async getMessagesForUser(userId: string) {
        return prisma.message.findMany({
          where: {
            OR: [
              { senderId: userId },
              { receiverId: userId },
            ],
          },
          orderBy: {
            createdAt: 'asc',
          },
        });
      }
    

      async getMessagesBetweenUsers(user1Id: string, user2Id: string) {
        return prisma.message.findMany({
          where: {
            OR: [
              { senderId: user1Id, receiverId: user2Id },
              { senderId: user2Id, receiverId: user1Id },
            ],
          },
          orderBy: {
            createdAt: 'asc',
          },
        });
      }
}
