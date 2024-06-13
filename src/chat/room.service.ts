import { Injectable } from '@nestjs/common';
import { PrismaClient, Room, User } from '@prisma/client';
import { IPaginationOptions, Pagination } from 'nestjs-typeorm-paginate';

const prisma = new PrismaClient();

@Injectable()
export class RoomService {
  constructor() {}

  async createRoom(room: Room, creator: User): Promise<Room> {
    const newRoom = await this.addCreatorToRoom(room, creator);
    return prisma.room.create({
      data: newRoom,
    });
  }

  async getRoom(roomId: string): Promise<Room | null> {
    return prisma.room.findUnique({
      where: { id: roomId },
      include: { users: true },
    });
  }

  async getRoomsForUser(userId: number, options: IPaginationOptions): Promise<Pagination<Room>> {
    const query = prisma.room.findMany({
      where: {
        users: {
          some: {
            id: userId,
          },
        },
      },
      include: {
        users: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
      skip: options.page * options.limit,
      take: options.limit,
    });

    const totalCount = await prisma.room.count({
      where: {
        users: {
          some: {
            id: userId,
          },
        },
      },
    });

    const rooms = await query;

    return {
      items: rooms,
      meta: {
        totalItems: totalCount,
        itemCount: rooms.length,
        itemsPerPage: options.limit,
        totalPages: Math.ceil(totalCount / options.limit),
        currentPage: options.page,
      },
    };
  }

  async addCreatorToRoom(room: Room, creator: User): Promise<Room> {
    room.users = [...room.users, creator];
    return room;
  }
}
