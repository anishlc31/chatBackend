import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { IPaginationOptions, Pagination } from 'nestjs-typeorm-paginate';

const prisma = new PrismaClient();

@Injectable()
export class RoomService {
  constructor() {}

  async createRoom(roomId: string, userId: string) {
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

  async getRoomForUser(userId: string, options: IPaginationOptions): Promise<Pagination<any>> {
    const page = Number(options.page);
    const limit = Number(options.limit);

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
}
