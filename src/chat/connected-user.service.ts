import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateConnectedUserDto } from './dto/connectedUser.dto';

const prisma = new PrismaClient();

@Injectable()
export class ConnectedUserService {
  constructor() {}

  async create(connectedUserDto: CreateConnectedUserDto): Promise<any> {
    const { socketId, userId } = connectedUserDto;

    const createdConnectedUser = await prisma.connectedUser.create({
      data: {
        socketId,
        user: { connect: { id: userId } },
      },
      include: {
        user: true,
      },
    });

    return {
      id: createdConnectedUser.id,
      socketId: createdConnectedUser.socketId,
      user: {
        id: createdConnectedUser.user.id,
        Username: createdConnectedUser.user.Username,
        email: createdConnectedUser.user.email,
        verificationToken: createdConnectedUser.user.verificationToken,
        isVerified: createdConnectedUser.user.isVerified,
      },
    };
  }

  async findByUser(userId: string) {
    const connectedUsers = await prisma.connectedUser.findMany({
      where: {
        userId,
      },
      include: {
        user: true,
      },
    });

    return connectedUsers.map((cu) => ({
      id: cu.id,
      socketId: cu.socketId,
      user: {
        id: cu.user.id,
        Username: cu.user.Username,
        email: cu.user.email,
        verificationToken: cu.user.verificationToken,
        isVerified: cu.user.isVerified,
      },
    }));
  }

  async deleteBySocketId(socketId: string): Promise<void> {
    await prisma.connectedUser.deleteMany({
      where: {
        socketId,
      },
    });
  }

  async deleteAll(): Promise<void> {
    await prisma.connectedUser.deleteMany({});
  }
}
