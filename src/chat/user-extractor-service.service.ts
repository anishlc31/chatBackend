import { Injectable, UnauthorizedException } from '@nestjs/common';

import { Socket } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';
import { JwtPayload } from 'src/auth/types';

@Injectable()
export class UserExtractorService {
  constructor(private readonly authService: AuthService) {}

  async extractUserId(socket: Socket): Promise<string> {
    const token = socket.handshake.headers.authorization;
    if (!token) {
      throw new UnauthorizedException('Token not provided');
    }

    const decodedToken = await this.authService.verifyJwt(token);
    const user = decodedToken as JwtPayload;
    console.log(user)
    return user.sub;
  }
}
