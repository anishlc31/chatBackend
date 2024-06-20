import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { loginDto, singupDto } from './dto';
import * as argon from 'argon2';
import { PrismaClient } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { JwtPayload } from './types';
import { Like } from 'typeorm';


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
  
      const token = await this.jwtService.signAsync(jwtPayload, {
          secret: this.configService.get<string>('JWT_SECRET'),
          expiresIn: this.configService.get<string>('JWT_LIFETIME'),
      });
  
      return { access_token: token };
  }
  

      async logout(userId: string) {
      
        return true;
      }


   
  async verifyJwt(token: string): Promise<JwtPayload> {
    try {
      return this.jwtService.verify<JwtPayload>(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
    } catch (error) {
      console.error('JWT Verification Error:', error.message);
      throw new UnauthorizedException('Invalid token');
    }
  }



    async getOne(userId: string) {
      const user = await prisma.user.findUnique({
          where: {
              id: userId,
          },
      });

      if (!user) {
          throw new ForbiddenException('User not found');
      }

      return user;
  }


  async findAllByUsername(Username: string) {
    return prisma.user.findMany({
      where: {
        Username: {
          contains: Username.toLowerCase(),
          mode: 'insensitive',
        },
      },
    });
  }

}
