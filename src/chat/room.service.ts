import { Injectable } from '@nestjs/common';
import { PrismaClient, Room } from '@prisma/client';
import { IPaginationOptions, Pagination } from 'nestjs-typeorm-paginate';
import { CreateRoomDto } from './dto/room.dto';

@Injectable()
export class RoomService {
  private readonly prisma = new PrismaClient();

  constructor() {}

  async createRoom(room: CreateRoomDto, creatorId: string): Promise<Room> {
    return this.prisma.room.create({
      data: {
        name: room.name,
        description: room.description,
        userId: creatorId,
      },
      include: {
        users: true,
      },
    });
  }

  async getRoom(roomId: string): Promise<Room | null> {
    return this.prisma.room.findUnique({
      where: { id: roomId },
      include: { users: true },
    });
  }

  async getRoomsForUser(userId: string, options: IPaginationOptions): Promise<Pagination<Room>> {
    const skip = (Number(options.page) - 1) * Number(options.limit);
    const take = Number(options.limit);

    const rooms = await this.prisma.room.findMany({
      where: {
        userId,
      },
      include: {
        users: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
      skip,
      take,
    });

    const totalCount = await this.prisma.room.count({
      where: {
        userId,
      },
    });

    return {
      items: rooms,
      meta: {
        totalItems: totalCount,
        itemCount: rooms.length,
        itemsPerPage: take,
        totalPages: Math.ceil(totalCount / take),
        currentPage: Number(options.page),
      },
    };
  }
}
