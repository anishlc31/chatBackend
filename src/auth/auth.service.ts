import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { loginDto, singupDto } from './dto';
import * as argon from 'argon2';
import { PrismaClient } from '@prisma/client';
import { JwtPayload } from 'jsonwebtoken';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';


const prisma = new PrismaClient();

@Injectable()
export class AuthService {


    constructor( private jwtService :JwtService, private configService : ConfigService){

    }
     async signup(dto : singupDto){

        const hash = await argon.hash(dto.password);

        const user = await prisma.user
          .create({
            data: {
                Username: dto.Username,
              email: dto.email,
              password : hash,
              
            },
          })
          .catch((error) => {
            if (error instanceof PrismaClientKnownRequestError) {
              if (error.code === 'P2002') {
                throw new ForbiddenException('Credentials incorrect');
              }
            }
            throw error;
          });

          const tokens = await this.getTokens(user.id, user.email);

          return tokens;


    }



  async login(dto: loginDto){
    const user = await prisma.user.findFirst({
      where: {
        email: dto.email,
      },
    });

    if (!user) throw new ForbiddenException('Access Denied');

    const passwordMatches = await argon.verify(user.password, dto.password);
    if (!passwordMatches) throw new ForbiddenException('Access Denied');

    const tokens = await this.getTokens(user.id, user.email);

    return tokens;
  }

    async getTokens(userId: string, email: string) {
        const jwtPayload: JwtPayload = {
          sub: userId,
          email: email,
        };
    
        const token = await Promise.all([
          this.jwtService.signAsync(jwtPayload, {
            secret: this.configService.get<string>('JWT_SECRET'),
            expiresIn: '15m',
          }),
       
        ]);
    
        return token
    
      }


      async logout(userId: string) {
      
        return true;
      }

}
