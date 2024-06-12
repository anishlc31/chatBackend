import { Injectable } from '@nestjs/common';
import { PrismaClient, Room, User } from '@prisma/client';
import { Pagination, paginate } from 'nestjs-typeorm-paginate';

const prisma = new PrismaClient();


@Injectable()
export class RoomService {
  constructor() {}

  async createRoom(roomData: { name: string }, creatorId: string): Promise<Room> {
    const room = await prisma.room.create({
      data: {
        name: roomData.name,
        users: {
          connect: { id: creatorId },
        },
      },
    });
    return room;
  }

  async getRoom(roomId: string): Promise<Room | null> {
    return prisma.room.findUnique({
      where: { id: roomId },
      include: { users: true },
    });
  }

  async getRoomsForUser(userId: string, options: { page: number; limit: number }): Promise<Pagination<Room>> {
    const [rooms, total] = await prisma.$transaction([
      prisma.room.findMany({
        where: {
          users: { some: { id: userId } },
        },
        include: { users: true },
        orderBy: { updatedAt: 'desc' },
        skip: (options.page - 1) * options.limit,
        take: options.limit,
      }),
      this.prisma.room.count({
        where: {
          users: { some: { id: userId } },
        },
      }),
    ]);

    return paginate(rooms, options, total);
  }
}
