import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';
import { UserExtractorService } from '../user-extractor-service.service';
import { RoomService } from '../room.service';

@WebSocketGateway({
  cors: { origin: ['https://hoppscotch.io', 'http://localhost:3000', 'http://localhost:4200'] },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private roomService: RoomService,
    private readonly userExtractorService: UserExtractorService
  ) {}

  @WebSocketServer()
  server: Server;

  // async handleConnection(socket: Socket) {
  //   try {
  //     // console.log('Headers:', socket.handshake.headers);
  //     const userId = await this.userExtractorService.extractUserId(socket);
  //     console.log('User ID:', userId);
  
  //     if (!userId) {
  //       return this.disconnect(socket);
  //     } else {
  //       socket.data.user = userId;
  //       console.log('Socket data after setting user:', socket.data);
  //       const room = await this.roomService.getRoomForUser(userId, { page: 1, limit: 10 });
  //       return this.server.to(socket.id).emit('rooms', room);
  //     }
  //   } catch (error) {
  //     console.error('Connection Error:', error);
  //     return this.disconnect(socket);
  //   }
  // }
  

  // handleDisconnect(client: Socket) {
  //   //console.log(`Client disconnected: ${client.id}`);
  // }

  // private disconnect(socket: Socket) {
  //   socket.emit('Error', new UnauthorizedException());
  //   socket.disconnect();
  // }





  // @SubscribeMessage('createRoom')
  // async onCreateRoom(socket: Socket, room: string) {
  //   console.log('Socket ID:', socket.data.user);
  //   return this.roomService.createRoom(room, socket.data.user);
  // }


  @SubscribeMessage('message')
  handleMessage(client:any , payload : any )  {
 this.server.emit('message', 'test ')
  }


  handleConnection(client: any, ...args: any[]) {
    console.log('connected ')
    this.server.emit('message', 'test ')

  }

   handleDisconnect(client: Socket) {
    console.log('disconnected ')
  }
  
}
