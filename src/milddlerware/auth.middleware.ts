import { HttpException, HttpStatus, Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { UsermainService } from 'src/user/serive/usermain.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {

  constructor(private userService: UsermainService) {}

  async use(req: any, res: any, next: NextFunction) {
    try {
      const authorizationHeader = req.headers['authorization'];
      if (!authorizationHeader) {
        throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
      }

      const tokenArray = authorizationHeader.split(' ');
      if (tokenArray.length !== 2 || tokenArray[0] !== 'Bearer') {
        throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
      }

      const token = tokenArray[1];
      const decodedToken = await this.userService.verifyJwt(token);

      const user = await this.userService.getOne(decodedToken.sub);
      if (user) {
        req.user = user;
        next();
      } else {
        throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
      }
    } catch (error) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
  }
}
