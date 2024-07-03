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
    const userId = client.handshake.query.userId as string;
    await this.sendUnseenMessageCounts(userId);
  }

  async handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @MessageBody() userId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(userId);
    this.sendUnseenMessageCounts(userId);
    console.log(`Client ${client.id} joined room ${userId}`);
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody() data: { senderId: string; receiverId: string; content: string },
    @ConnectedSocket() client: Socket,
  ) {
    const message = await this.chatService.sendMessage(data.senderId, data.receiverId, data.content);
    this.server.to(data.receiverId).emit('receiveMessage', message);
    await this.sendUnseenMessageCounts(data.senderId);
    await this.sendUnseenMessageCounts(data.receiverId);


    // Emit the status update
    await this.chatService.markMessageAsDelivered(message.id);

  this.server.to(data.senderId).emit('statusUpdate', message.status);
  this.server.to(data.receiverId).emit('statusUpdate', message.status);

   

    return message;
  }

  @SubscribeMessage('getMessages')
  async handleGetMessages(
    @MessageBody() data: { user1Id: string; user2Id: string; skip: number; take: number },
    @ConnectedSocket() client: Socket,
  ) {
    const messages = await this.chatService.getMessagesBetweenUsers(data.user1Id, data.user2Id, data.skip, data.take);
    await this.chatService.markMessagesAsSeen(data.user2Id, data.user1Id); 
    await this.sendUnseenMessageCounts(data.user1Id);
    await this.sendUnseenMessageCounts(data.user2Id);


    // Emit the status update for both users
  this.server.to(data.user1Id).emit('statusUpdate', 'SEEN');
  this.server.to(data.user2Id).emit('statusUpdate', 'SEEN');

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



  @SubscribeMessage('requestUnseenMessageCounts')
  async handleRequestUnseenMessageCounts(
    @MessageBody() userId: string,
    @ConnectedSocket() client: Socket,
  ) {
    await this.sendUnseenMessageCounts(userId);
  }

  private async sendUnseenMessageCounts(userId: string) {
    const counts = await this.chatService.getUnseenMessageCounts(userId);
    this.server.to(userId).emit('unseenMessageCounts', counts);
  }
}
