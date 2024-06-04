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


//first i will work till now video up to 8 
//to do that work i will do research about code of service and gataway to live chat 