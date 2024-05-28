import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';

@WebSocketGateway({ cors: { origin: ['https://hoppscotch.io', 'http://localhost:3000', 'http://localhost:4200'] } })
export class ChatGateway implements OnGatewayConnection ,OnGatewayDisconnect {
  
    constructor (private authSerive : AuthService){

    }

  @WebSocketServer()
  server: Server;

  async handleConnection(socket : Socket) {

    try{

        const decodedToken = await this.authSerive.verifyJwt(socket.handshake.headers.authorization);


    }catch{

    }
}


  handleDisconnect(client: any) {
    throw new Error('Method not implemented.');
}



@SubscribeMessage('message')
handleMessage(client: any, payload: any): string {
  return 'Hello world!';
}




}