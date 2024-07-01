import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ChatService } from './chat.service';
import { Public } from 'src/auth/decorator/public.decorator';

@Controller('chat')
export class ChatController {

    constructor(private chatService : ChatService){

    }

    @Post('/conntection/:user1Id/:user2Id')
    signup( @Query('user1Id') user1Id: string,
         @Query('user2Id') user2Id: string) {
        
            return this.chatService.createConversation(user1Id,user2Id);
    }
}
