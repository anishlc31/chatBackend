import { ChatService } from './chat.service';
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: { origin: ['https://hoppscotch.io', 'http://localhost:3000', 'http://localhost:4200'] },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private typingTimers: { [key: string]: NodeJS.Timeout } = {};

  constructor(private chatService: ChatService) {}

  @WebSocketServer()
  server: Server;

  afterInit(server: Server) {
    console.log('WebSocket server initialized');
  }

  async handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
    const userId = Array.isArray(client.handshake.query.userId)
      ? client.handshake.query.userId[0]
      : client.handshake.query.userId as string;

  }

  async handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    const userId = Array.isArray(client.handshake.query.userId)
      ? client.handshake.query.userId[0]
      : client.handshake.query.userId as string;

   
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @MessageBody() userId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(userId);
    console.log(`Client ${client.id} joined room ${userId}`);
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody() data: { senderId: string; receiverId: string; content: string },
    @ConnectedSocket() client: Socket,
  ) {
    const message = await this.chatService.sendMessage(data.senderId, data.receiverId, data.content);
    this.server.to(data.receiverId).emit('receiveMessage', message);
    this.server.to(data.senderId).emit('updateMessageStatus', { messageId: message.id, status: 'delivered' });
    this.server.to(data.senderId).emit('updateUserList', { userId: data.receiverId });
    this.server.to(data.receiverId).emit('updateUserList', { userId: data.senderId });
    await this.chatService.markMessageAsDelivered(message.id);

    return message;
  }

  @SubscribeMessage('getMessages')
  async handleGetMessages(
    @MessageBody() data: { user1Id: string; user2Id: string; skip: number; take: number },
    @ConnectedSocket() client: Socket,
  ) {
    const messages = await this.chatService.getMessagesBetweenUsers(data.user1Id, data.user2Id, data.skip, data.take);
    
    await this.chatService.markMessagesAsSeen(data.user2Id, data.user1Id); // Mark messages as seen
    return messages;
  }

  @SubscribeMessage('typing')
  handleTyping(
    @MessageBody() data: { senderId: string; receiverId: string },
    @ConnectedSocket() client: Socket,
  ) {
    this.server.to(data.receiverId).emit('userTyping', { senderId: data.senderId, typing: true });

    if (this.typingTimers[data.senderId]) {
      clearTimeout(this.typingTimers[data.senderId]);
    }

    this.typingTimers[data.senderId] = setTimeout(() => {
      this.server.to(data.receiverId).emit('userTyping', { senderId: data.senderId, typing: false });
    }, 3000);
  }

  @SubscribeMessage('stopTyping')
  handleStopTyping(
    @MessageBody() data: { senderId: string; receiverId: string },
    @ConnectedSocket() client: Socket,
  ) {
    this.server.to(data.receiverId).emit('userTyping', { senderId: data.senderId, typing: false });

    if (this.typingTimers[data.senderId]) {
      clearTimeout(this.typingTimers[data.senderId]);
      delete this.typingTimers[data.senderId];
    }
  }
}