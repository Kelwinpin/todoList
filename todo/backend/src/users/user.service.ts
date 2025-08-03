import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Users } from 'generated/prisma';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<Users[]> {
    return this.prisma.user.findMany({
      where: { deletedAt: null },
    });
  }

  async findById(id: number): Promise<Users> {
    const user = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
    });

    if (!user) throw new NotFoundException('Usuário não encontrado');
    return user;
  }

  async update(id: number, data: Partial<Users>): Promise<Users> {
    await this.findById(id); // Verifica se existe
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async softDelete(id: number): Promise<Users> {
    await this.findById(id); // Verifica se existe
    return this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
