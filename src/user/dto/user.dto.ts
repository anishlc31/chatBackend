import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength, Validate } from "class-validator";

export class userDto {
    @IsEmail({}, { each: true })
    @IsNotEmpty()
    email: string[];
  
      @IsString()
      @IsNotEmpty()
      password : string;
  
  
  @IsString()
    @MaxLength(50)
    @MinLength(4)
    Username: string;
  
}