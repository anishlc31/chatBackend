import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';
import { GetCurrentUserId } from 'src/auth/decorator/user.decorator';
import { UserExtractorService } from '../user-extractor-service.service';

@WebSocketGateway({ cors: { origin: ['https://hoppscotch.io', 'http://localhost:3000', 'http://localhost:4200'] } })
export class ChatGateway implements OnGatewayConnection ,OnGatewayDisconnect {
  
    constructor (private authSerive : AuthService , private readonly userExtractorService: UserExtractorService,
    ){

    }

  @WebSocketServer()
  server: Server;

  title : string[] = [];

  async handleConnection(socket : Socket) {

    try{


        const userId = await this.userExtractorService.extractUserId(socket);
        console.log(userId)

      if(!userId){
return  this.disconnet(socket)

      }else {
this.title.push('value' + Math.random().toString());
this.server.emit('message', this.title)
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



@SubscribeMessage('message')
handleMessage(client: any, payload: any): string {
  return 'Hello world!';
}




}


//fpor push 

