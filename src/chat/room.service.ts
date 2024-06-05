import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { IPaginationOptions } from 'nestjs-typeorm-paginate';
const prisma = new PrismaClient();

@Injectable()
export class RoomService {


    constructor() {

    }

    async createRoom( userId : string , roomId :string ){

        const newRoom = await this.addcCreatorToRoom(userId, roomId);
return newRoom;
    }


    async getRoomForUser( userId : string ,  options: IPaginationOptions){

    }

    async addcCreatorToRoom(userId : string , roomId :string){

    }
}


//Now it's turn to use chat gpt and research instead of copying and past of the video