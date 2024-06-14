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

  async handleConnection(socket: Socket) {
    try {
      const userId = await this.userExtractorService.extractUserId(socket);
      if (!userId) {
        return this.disconnect(socket);
      } else {
        socket.data.user = userId;
        const rooms = await this.roomService.getRoomsForUser(userId, { page: 1, limit: 10 });
        return this.server.to(socket.id).emit('rooms', rooms);
      }
    } catch {
      return this.disconnect(socket);
    }
  }

  handleDisconnect(socket: Socket) {
    return this.disconnect(socket);
  }

  private disconnect(socket: Socket) {
    socket.emit('Error', new UnauthorizedException());
    socket.disconnect();
  }

  @SubscribeMessage('createRoom')
  async onCreateRoom(socket: Socket, roomData: any) {
    try {
      const createdRoom = await this.roomService.createRoom(roomData, socket.data.user);
      const rooms = await this.roomService.getRoomsForUser(socket.data.user, { page: 1, limit: 10 });
      return this.server.to(socket.id).emit('rooms', rooms);
    } catch (error) {
      socket.emit('Error', error);
    }
  }
}
