import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Request } from 'express';
import { User, users } from '../common/data';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'super-secret-key-unknown',
    });
  }

  async validate(payload: { userId: string }): Promise<User> {
    const user = users.find(u => u.id === payload.userId);
    if (!user) {
      throw new UnauthorizedException('Invalid token - user not found');
    }
    return user;
  }
}
