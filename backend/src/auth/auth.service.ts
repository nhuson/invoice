import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity';

export interface JwtPayload {
  sub: string;
  email: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.users.findByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.issueToken(user);
  }

  async register(email: string, password: string, fullname: string) {
    const normalizedEmail = email.trim().toLowerCase();
    if (await this.users.findByEmail(normalizedEmail)) {
      throw new ConflictException('Email is already registered');
    }

    try {
      const user = await this.users.create({
        email: normalizedEmail,
        passwordHash: await bcrypt.hash(password, 10),
        fullname: fullname.trim(),
      });
      return this.issueToken(user);
    } catch (err) {
      if ((err as { code?: string }).code === '23505') {
        throw new ConflictException('Email is already registered');
      }
      throw err;
    }
  }

  toProfile(user: User) {
    return { id: user.id, email: user.email, fullname: user.fullname };
  }

  private async issueToken(user: User) {
    const payload: JwtPayload = { sub: user.id, email: user.email };
    return {
      accessToken: await this.jwt.signAsync(payload),
      user: this.toProfile(user),
    };
  }
}
