import { ForbiddenException, Injectable } from '@nestjs/common';
import { singupDto } from '../dto/user.dto';
import { PrismaClient } from '@prisma/client';
import { PrismaClientValidationError } from '@prisma/client/runtime/library';
import * as argon from 'argon2';
import { loginDto } from '../dto/login.dto';
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();


@Injectable()
export class UsermainService {


    async signup( dto: singupDto) {
      
     const { email , password , Username} = dto
      
        const existingUser = await prisma.user.findFirst({
            where: {
              email: email,
            },
          });
      
    
        if (existingUser) {
          throw new ForbiddenException('Email is already in use');
        }
        const hash = await argon.hash(password);
        try {
          const user = await prisma.user.create({
            data: {
                email  :email ,
                Username : Username,
                password : hash
                
              },
           
            },
          
          );
      const token = this.signToken(user.id, dto.email);
          return {
       access_token: token,
            id: user.id,
          };
        } catch (error) {
          console.log(error); 
    
          if (error instanceof PrismaClientValidationError) {
            if (error) {
              throw new ForbiddenException('Invalide token ');
            }
            throw error;
          }
        }
      }
    



  signToken(userId: string, email: any): Promise<string> {
    const payload = {
      sub: userId,
      email,
    };
    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_LIFETIME,
    });
  }



  async login(dto: loginDto) {
    if (!dto.email || !dto.password) {
      return ('Please provide email and password');
    }
  
    const user = await prisma.user.findFirst({
      where: {
        email:dto.email
      },
    });
  
     if (!user) {
      return 'invaild credentials'
    }
  
    const pwMatches = await argon.verify(user.password, dto.password);
  
    if (!pwMatches) {
      return 'invaild credentials'
    }
  
    const token = this.signToken(user.id, dto.email);
    return {
      access_token: token,
      id: user.id,
    };
  }
  

}