import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './gateway/chat.gateway';

@Module({
  providers: [ChatService, ChatGateway]
})
export class ChatModule {}
