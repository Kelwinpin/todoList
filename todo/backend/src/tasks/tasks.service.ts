import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto, UpdateTaskDto } from './tasks.dto';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, dto: CreateTaskDto) {
    if (!dto.title || !dto.day_to_do || !dto.priority_id) {
      throw new BadRequestException('Campos obrigatórios não informados');
    }

    const priority = await this.prisma.dOM_priority.findUnique({
      where: { id: dto.priority_id },
    });

    if (!priority) {
      throw new BadRequestException('Prioridade inválida');
    }

    return await this.prisma.tasks.create({
      data: {
        title: dto.title,
        description: dto.description,
        day_to_do: new Date(dto.day_to_do),
        user_id: userId,
        priority_id: dto.priority_id,
      },
      include: {
        priority: true,
      },
    });
  }

  async findAll(userId: number) {
    return await this.prisma.tasks.findMany({
      where: {
        user_id: userId,
        deleted_at: null,
      },
      include: {
        priority: true,
      },
      orderBy: {
        day_to_do: 'asc',
      },
    });
  }

  async findOne(userId: number, id: number) {
    const task = await this.prisma.tasks.findFirst({
      where: {
        id,
        user_id: userId,
        deleted_at: null,
      },
      include: {
        priority: true,
      },
    });

    if (!task) {
      throw new NotFoundException('Task não encontrada');
    }

    return task;
  }

  async update(userId: number, id: number, dto: UpdateTaskDto) {
    const task = await this.findOne(userId, id);

    if (dto.priority_id) {
      const priority = await this.prisma.dOM_priority.findUnique({
        where: { id: dto.priority_id },
      });

      if (!priority) {
        throw new BadRequestException('Prioridade inválida');
      }
    }

    return await this.prisma.tasks.update({
      where: { id },
      data: {
        ...(dto.title && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.completed !== undefined && { completed: dto.completed }),
        ...(dto.day_to_do && { day_to_do: new Date(dto.day_to_do) }),
        ...(dto.priority_id && { priority_id: dto.priority_id }),
      },
      include: {
        priority: true,
      },
    });
  }

  async remove(userId: number, id: number) {
    const task = await this.findOne(userId, id);

    if (!task) {
      throw new ForbiddenException('Não foi possível encontrar a tarefa');
    }

    return await this.prisma.tasks.update({
      where: { id },
      data: {
        deleted_at: new Date(),
      },
    });
  }

  async getPriorities() {
    return await this.prisma.dOM_priority.findMany({
      orderBy: {
        id: 'asc',
      },
    });
  }
}
