import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';
import { GetCurrentUserId } from 'src/auth/decorator/user.decorator';
import { UserExtractorService } from '../user-extractor-service.service';
import { RoomService } from '../room.service';

@WebSocketGateway({ cors: { origin: ['https://hoppscotch.io', 'http://localhost:3000', 'http://localhost:4200'] } })
export class ChatGateway implements OnGatewayConnection ,OnGatewayDisconnect {
  
    constructor (private roomService : RoomService , private readonly userExtractorService: UserExtractorService,
    ){

    }

  @WebSocketServer()
  server: Server;


  async handleConnection(socket : Socket) {

    try{


        const userId = await this.userExtractorService.extractUserId(socket);
        console.log(userId)

      if(!userId){
return  this.disconnet(socket)

      }else {
        socket.data.user= userId;
        const room = await this.roomService.getRoomForUser(userId, {page:1 , limit :10})

        return this.server.to(socket.id).emit('rooms',room)

      }

    }catch{
return  this.disconnet(socket)
    }
}


  handleDisconnect(client: any) {
}

private disconnet (socket : Socket){
  socket.emit("Error " , new UnauthorizedException)
  socket.disconnect();
}



@SubscribeMessage('createRoom')handleMessage(client: any, payload: any): string {
  return 'Hello world!';
}
async onCreateRoom(socket : Socket ){
  return this.roomService.createRoom()
}




}
