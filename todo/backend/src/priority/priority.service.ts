import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePriorityDto, UpdatePriorityDto } from './priority.dto';

@Injectable()
export class PriorityService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreatePriorityDto) {
    if (!dto.description) {
      throw new BadRequestException('Descrição é obrigatória');
    }

    return await this.prisma.dOM_priority.create({
      data: {
        description: dto.description,
      },
    });
  }

  async findAll() {
    return await this.prisma.dOM_priority.findMany({
      orderBy: {
        id: 'asc',
      },
    });
  }

  async findOne(id: number) {
    const priority = await this.prisma.dOM_priority.findUnique({
      where: { id },
    });

    if (!priority) {
      throw new NotFoundException('Prioridade não encontrada');
    }

    return priority;
  }

  async update(id: number, dto: UpdatePriorityDto) {
    await this.findOne(id);

    return await this.prisma.dOM_priority.update({
      where: { id },
      data: {
        ...(dto.description && { description: dto.description }),
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    const tasksWithPriority = await this.prisma.tasks.findFirst({
      where: {
        priority_id: id,
        deleted_at: null,
      },
    });

    if (tasksWithPriority) {
      throw new BadRequestException('Não é possível excluir prioridade que está sendo usada por tasks');
    }

    return await this.prisma.dOM_priority.delete({
      where: { id },
    });
  }
}