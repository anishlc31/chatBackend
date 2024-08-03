import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength, Validate } from "class-validator";

export class singupDto {
    @IsEmail({}, { each: true })
    @IsNotEmpty()
    //email must be unique 
    email: string;
  
      @IsString()
      @IsNotEmpty()
      password : string;
  
  
  @IsString()
    @MaxLength(50)
    @MinLength(4)
    username: string;
  
}