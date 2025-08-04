import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Users } from 'generated/prisma';

type SafeUser = {
  id: number;
  name: string;
  email: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
};

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<SafeUser[]> {
    return this.prisma.users.findMany({
      where: { deleted_at: null },
      select: {
        id: true,
        name: true,
        email: true,
        created_at: true,
        updated_at: true,
        deleted_at: true,
      },
    });
  }

  async findById(id: number): Promise<SafeUser> {
    const user = await this.prisma.users.findFirst({
      where: { id, deleted_at: null },
      select: {
        id: true,
        name: true,
        email: true,
        created_at: true,
        updated_at: true,
        deleted_at: true,
      },
    });

    if (!user) throw new NotFoundException('Usuário não encontrado');
    return user;
  }

  async update(id: number, data: Partial<Users>): Promise<Users> {
    await this.findById(id);
    return this.prisma.users.update({
      where: { id },
      data,
    });
  }

  async softDelete(id: number): Promise<Users> {
    await this.findById(id);
    return this.prisma.users.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  }
}
