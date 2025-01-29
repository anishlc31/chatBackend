import { WebSocketGateway, SubscribeMessage, MessageBody, ConnectedSocket, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@WebSocketGateway({ cors: true })
export class FriendshipGateway {
  @WebSocketServer() server: Server;

  // Emit notification count to a specific user
  async emitNotificationCount(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user) {
      console.log('Sending notification count:', user.friendRequestNotifacation);
      this.server.to(userId).emit('notificationCount', user.friendRequestNotifacation);
    }
  }
  

  // Handle friend request notifications
  async handleFriendRequest(requesterId: string, recipientId: string) {
    await prisma.user.update({
      where: { id: recipientId },
      data: { friendRequestNotifacation: { increment: 1 } },
    });
    this.emitNotificationCount(recipientId);
  }

  // Reset notification count for a user
  async resetNotificationCount(userId: string) {
    await prisma.user.update({
      where: { id: userId },
      data: { friendRequestNotifacation: 0 },
    });
    this.emitNotificationCount(userId);
  }

  // Handle button click to reset notifications
  @SubscribeMessage('resetNotificationCount')
  async handleResetNotification(@MessageBody() userId: string, @ConnectedSocket() client: Socket) {
    await this.resetNotificationCount(userId);
  }

 
}
