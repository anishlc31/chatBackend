import { Controller, Get, Param, Post, Query, Req } from '@nestjs/common';
import { ChatService } from './chat.service';
import { Public } from 'src/auth/decorator/public.decorator';
import { AuthService } from 'src/auth/auth.service';

@Controller('chat')
export class ChatController {

    constructor(private readonly chatService: ChatService, private authService : AuthService  ) {}

    @Get(':userId')
  async getConversations(@Param('userId') userId: string) {
    return this.chatService.getConversations(userId);
  }
   
}
