import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto, LoginDto } from './auth.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    if (
      dto.name === undefined ||
      dto.email === undefined ||
      dto.password === undefined
    ) {
      throw new BadRequestException('Campos obrigatórios não informados');
    }

    if (await this.prisma.users.findUnique({ where: { email: dto.email } })) {
      throw new ConflictException('Email já cadastrado');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.users.create({
      data: { email: dto.email, password: hashedPassword, name: dto.name },
    });

    return this.signToken(user.id, user.email);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.users.findUnique({
      where: { email: dto.email },
    });
    if (!user) throw new UnauthorizedException('Email ou senha inválidos');

    const passwordMatch = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatch)
      throw new UnauthorizedException('Email ou senha inválidos');

    return this.signToken(user.id, user.email);
  }

  async signToken(userId: number, email: string) {
    const payload = { sub: userId, email };
    return {
      access_token: await this.jwt.signAsync(payload),
    };
  }
}
