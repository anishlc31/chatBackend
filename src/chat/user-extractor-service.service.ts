import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Socket } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';
import { JwtPayload } from 'src/auth/types';

@Injectable()
export class UserExtractorService {
  constructor(private readonly authService: AuthService) {}

  async extractUserId(socket: Socket): Promise<string> {
    const authHeader = socket.handshake.headers.authorization;
    console.log('Auth Header:', authHeader);

    if (!authHeader) {
      throw new UnauthorizedException('Token not provided');
    }

    const token = authHeader.split(' ')[1]; // Extract the token after 'Bearer'
    if (!token) {
      throw new UnauthorizedException('Token not provided');
    }

    console.log('Extracted Token:', token);

    const decodedToken = await this.authService.verifyJwt(token);
    const user = decodedToken as JwtPayload;
    console.log('Decoded Token:', user);
    return user.sub;
  }
}
