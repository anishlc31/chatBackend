import { Injectable } from '@nestjs/common';
import { PrismaClient, Room } from '@prisma/client';
import { IPaginationOptions, Pagination } from 'nestjs-typeorm-paginate';

const prisma = new PrismaClient();

@Injectable()
export class RoomService {
  constructor() {}

  async createRoom(roomId: string, userId: string): Promise<Room> {
    const newRoom = await this.addCreatorToRoom(roomId, userId);
    return newRoom;
  }

  async getRoomForUser(userId: string, options: IPaginationOptions): Promise<Pagination<Room>> {
    const { page, limit } = options;

    const rooms = await prisma.room.findMany({
      where: { userId },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    const totalRooms = await prisma.room.count({
      where: { userId },
    });

    return {
      items: rooms,
      meta: {
        totalItems: totalRooms,
        itemCount: rooms.length,
        itemsPerPage: limit,
        totalPages: Math.ceil(totalRooms / limit),
        currentPage: page,
      },
    };
  }

  async addCreatorToRoom(roomId: string, userId: string): Promise<Room> {
    const newRoom = await prisma.room.create({
      data: {
        id: roomId,
        userId: userId,
        name: `Room ${roomId}`,
        description: `Description for Room ${roomId}`,
      },
    });

    return newRoom;
  }
}
