import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { IPaginationOptions } from 'nestjs-typeorm-paginate';
const prisma = new PrismaClient();

@Injectable()
export class RoomService {


    constructor() {

    }

    async createRoom(){

    }


    async getRoomForUser( userId : string ,  options: IPaginationOptions){

    }

    async addcCreatorToRoom(){

    }
}
