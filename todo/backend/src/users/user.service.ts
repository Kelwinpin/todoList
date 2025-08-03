import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Users } from 'generated/prisma';

type SafeUser = {
  id: number;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<SafeUser[]> {
    return this.prisma.users.findMany({
      where: { deletedAt: null },
      select: { id: true, name: true, email: true, createdAt: true, updatedAt: true, deletedAt: true },
    });
  }

  async findById(id: number): Promise<SafeUser> {
    const user = await this.prisma.users.findFirst({
      where: { id, deletedAt: null },
      select: { id: true, name: true, email: true, createdAt: true, updatedAt: true, deletedAt: true },
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
      data: { deletedAt: new Date() },
    });
  }
}
