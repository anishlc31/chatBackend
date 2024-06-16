import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UnauthorizedException } from '@nestjs/common';
import { UserExtractorService } from '../user-extractor-service.service';
import { RoomService } from '../room.service';
import { validateOrReject } from 'class-validator';
import { CreateRoomDto } from '../dto/room.dto';

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
    console.log('Client connected:', socket.id);
    try {
      const userId = await this.userExtractorService.extractUserId(socket);
      console.log('Extracted userId:', userId);

      if (!userId) {
        console.log('User ID not found, disconnecting...');
        return this.disconnect(socket);
      } else {
        socket.data.user = userId;
        const rooms = await this.roomService.getRoomsForUser(userId, { page: 1, limit: 10 });
        console.log('Rooms for user:', rooms);
        return this.server.to(socket.id).emit('rooms', rooms);
      }
    } catch (error) {
      console.error('Error during connection:', error);
      return this.disconnect(socket);
    }
  }

  handleDisconnect(socket: Socket) {
    console.log('Client disconnected:', socket.id);
    return this.disconnect(socket);
  }

  private disconnect(socket: Socket) {
    socket.emit('Error', new UnauthorizedException());
    socket.disconnect();
  }

  @SubscribeMessage('createRoom')
  async onCreateRoom(socket: Socket, payload: { data: CreateRoomDto }) {
    console.log('Received createRoom event with data:', payload);
    try {
      const userId = socket.data.user;
      if (!userId) {
        throw new UnauthorizedException('User not authenticated');
      }

      const { name, description } = payload.data;
      const createRoomDto = new CreateRoomDto();
      createRoomDto.name = name;
      createRoomDto.description = description;

      await validateOrReject(createRoomDto);

      console.log('Creating room with data:', createRoomDto, 'for user:', userId);
      const createdRoom = await this.roomService.createRoom(createRoomDto, userId);
      console.log('Room created:', createdRoom);
      const rooms = await this.roomService.getRoomsForUser(userId, { page: 1, limit: 10 });
      console.log('Updated rooms for user:', rooms);
      return this.server.to(socket.id).emit('rooms', rooms);
    } catch (error) {
      console.error('Error creating room:', error);
      socket.emit('Error', error);
    }
  }
}
