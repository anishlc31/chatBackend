import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength, Validate } from "class-validator";

export class loginDto {
    @IsEmail({}, { each: true })
    @IsNotEmpty()
    email: string;
  
      @IsString()
      @IsNotEmpty()
      password : string;

  
}