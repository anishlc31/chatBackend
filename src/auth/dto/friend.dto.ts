// src/auth/dto/friend-request.dto.ts
import { IsString, IsEnum } from 'class-validator';

export class FriendRequestDto {
  @IsString()
  senderId: string;

  @IsString()
  receiverId: string;
}

export class UpdateFriendshipStatusDto {
  @IsString()
  friendshipId: string;

  @IsEnum(['PENDING', 'ACCEPTED', 'REJECTED', 'BLOCKED'])
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'BLOCKED';
}
