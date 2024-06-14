import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Socket } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';
import { JwtPayload } from 'src/auth/types';

@Injectable()
export class UserExtractorService {
  constructor(private readonly authService: AuthService) {}

  async extractUserId(socket: Socket): Promise<string> {
    const authHeader = socket.handshake.headers.authorization;
  //  console.log('Auth Header:', authHeader);

    if (!authHeader) {
      throw new UnauthorizedException('Token not provided');
    }

    // Handle token without 'Bearer' prefix
    const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;
   // console.log('Extracted Token:', token);

    try {
      const decodedToken = await this.authService.verifyJwt(token);
      const user = decodedToken as JwtPayload;
     // console.log('Decoded Token:', user);
      return user.sub;
    } catch (error) {
      console.error('Token Verification Error:', error);
      throw new UnauthorizedException('Invalid token');
    }
  }
}
