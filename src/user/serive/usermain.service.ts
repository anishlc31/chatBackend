import { ForbiddenException, Injectable } from '@nestjs/common';
import { singupDto } from '../dto/user.dto';
import { PrismaClient } from '@prisma/client';
import { PrismaClientValidationError } from '@prisma/client/runtime/library';
import * as argon from 'argon2';
import { loginDto } from '../dto/login.dto';
const jwt = require('jsonwebtoken');
import { PrismaService } from 'prisma/prisma.service'
import { v4 as uuidv4 } from 'uuid';
import { promisify } from 'util';
import { JwtService } from '@nestjs/jwt';

const prisma = new PrismaClient();

  
@Injectable()
export class UsermainService {

  constructor(private readonly jwtService: JwtService) {}

  async signup(dto: singupDto) {
    const { email, password, Username } = dto;
  const existingUser = await prisma.user.findFirst({
      where: { email },
    });

    if (existingUser) {
      throw new ForbiddenException('Email is already in use');
    }

    const hash = await argon.hash(password);

try{
  const user = await prisma.user.create({
    data: {
      email,
      Username,
      password: hash,
      
  }
 }
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
      return 'Please provide email and password';
    }

    const user = await prisma.user.findFirst({
      where: { email: dto.email },
    });

    if (!user) {
      return 'Invalid credentials';
    }

    const pwMatches = await argon.verify(user.password, dto.password);

    if (!pwMatches) {
      return 'Invalid credentials';
    }

    const token = await this.signToken(user.id, dto.email);
    return {
      access_token: token,
      id: user.id,
    };
  }

  async getAllUsers() {
    try {
      const users = await prisma.user.findMany();
      return users;
    } catch (error) {
      console.log(error);
      throw new ForbiddenException('Could not retrieve users');
    }
  }

  async verifyJwt(token: string): Promise<any> {
    try {
      return this.jwtService.verify(token, { secret: process.env.JWT_SECRET });
    } catch (error) {
      throw new ForbiddenException('Invalid token');
    }
  }
  async getOne(id: string) {
    try {
      return await prisma.user.findUniqueOrThrow({ where: { id } });
    } catch (error) {
      throw new ForbiddenException('User not found');
    }
  }
}
