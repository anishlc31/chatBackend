import { IsNotEmpty, IsString } from 'class-validator';

export class CreateConnectedUserDto {
  @IsNotEmpty()
  @IsString()
  socketId: string;

  @IsNotEmpty()
  @IsString()
  userId:string ;
}