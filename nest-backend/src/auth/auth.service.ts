import { Injectable, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { User, users, cleanUser } from '../common/data';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async register(data: { name: string; username: string; email: string; password: string }) {
    if (!data.name || !data.username || !data.email || !data.password) {
      throw new BadRequestException('Missing fields');
    }
    if (users.find(u => u.email === data.email || u.username === data.username)) {
      throw new BadRequestException('User exists');
    }
    const passwordHash = await bcrypt.hash(data.password, 10);
    const newUser: User = {
      id: randomUUID(),
      ...data,
      passwordHash,
    };
    users.push(newUser);
    const token = this.jwtService.sign({ userId: newUser.id });
    const { passwordHash: _, ...safeUser } = newUser;
    return { user: safeUser, token };
  }

  async login(email: string, password: string) {
    const user = users.find(u => u.email === email);
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new BadRequestException('Invalid credentials');
    }
    const token = this.jwtService.sign({ userId: user.id });
    const { passwordHash: _, ...safeUser } = user;
    return { user: safeUser, token };
  }
}
