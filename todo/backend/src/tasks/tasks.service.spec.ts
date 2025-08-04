import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto, UpdateTaskDto } from './tasks.dto';

describe('TasksService', () => {
  let service: TasksService;
  let prismaService: PrismaService;

  const mockTask = {
    id: 1,
    title: 'Test Task',
    description: 'Test Description',
    completed: false,
    day_to_do: new Date('2024-01-15'),
    created_at: new Date(),
    updated_at: new Date(),
    deleted_at: null,
    user_id: 1,
    priority_id: 1,
    priority: {
      id: 1,
      description: 'Alta',
    },
  };

  const mockPriority = {
    id: 1,
    description: 'Alta',
  };

  const mockPrismaService = {
    tasks: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    dOM_priority: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const validCreateDto: CreateTaskDto = {
      title: 'New Task',
      description: 'Task Description',
      day_to_do: '2024-01-15',
      priority_id: 1,
    };

    it('should create a task successfully', async () => {
      mockPrismaService.dOM_priority.findUnique.mockResolvedValue(mockPriority);
      mockPrismaService.tasks.create.mockResolvedValue(mockTask);

      const result = await service.create(1, validCreateDto);

      expect(prismaService.dOM_priority.findUnique).toHaveBeenCalledWith({
        where: { id: validCreateDto.priority_id },
      });
      expect(prismaService.tasks.create).toHaveBeenCalledWith({
        data: {
          title: validCreateDto.title,
          description: validCreateDto.description,
          day_to_do: new Date(validCreateDto.day_to_do),
          user_id: 1,
          priority_id: validCreateDto.priority_id,
        },
        include: {
          priority: true,
        },
      });
      expect(result).toEqual(mockTask);
    });

    it('should throw BadRequestException when title is missing', async () => {
      const invalidDto = { ...validCreateDto, title: undefined };

      await expect(service.create(1, invalidDto as any)).rejects.toThrow(
        new BadRequestException('Campos obrigatórios não informados'),
      );

      expect(prismaService.dOM_priority.findUnique).not.toHaveBeenCalled();
      expect(prismaService.tasks.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when day_to_do is missing', async () => {
      const invalidDto = { ...validCreateDto, day_to_do: undefined };

      await expect(service.create(1, invalidDto as any)).rejects.toThrow(
        new BadRequestException('Campos obrigatórios não informados'),
      );

      expect(prismaService.dOM_priority.findUnique).not.toHaveBeenCalled();
      expect(prismaService.tasks.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when priority_id is missing', async () => {
      const invalidDto = { ...validCreateDto, priority_id: undefined };

      await expect(service.create(1, invalidDto as any)).rejects.toThrow(
        new BadRequestException('Campos obrigatórios não informados'),
      );

      expect(prismaService.dOM_priority.findUnique).not.toHaveBeenCalled();
      expect(prismaService.tasks.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when priority does not exist', async () => {
      mockPrismaService.dOM_priority.findUnique.mockResolvedValue(null);

      await expect(service.create(1, validCreateDto)).rejects.toThrow(
        new BadRequestException('Prioridade inválida'),
      );

      expect(prismaService.dOM_priority.findUnique).toHaveBeenCalledWith({
        where: { id: validCreateDto.priority_id },
      });
      expect(prismaService.tasks.create).not.toHaveBeenCalled();
    });

    it('should create task without description', async () => {
      const dtoWithoutDescription = { ...validCreateDto, description: undefined };
      const taskWithoutDescription = { ...mockTask, description: null };

      mockPrismaService.dOM_priority.findUnique.mockResolvedValue(mockPriority);
      mockPrismaService.tasks.create.mockResolvedValue(taskWithoutDescription);

      const result = await service.create(1, dtoWithoutDescription);

      expect(prismaService.tasks.create).toHaveBeenCalledWith({
        data: {
          title: dtoWithoutDescription.title,
          description: undefined,
          day_to_do: new Date(dtoWithoutDescription.day_to_do),
          user_id: 1,
          priority_id: dtoWithoutDescription.priority_id,
        },
        include: {
          priority: true,
        },
      });
      expect(result).toEqual(taskWithoutDescription);
    });
  });

  describe('findAll', () => {
    it('should return all tasks for user', async () => {
      const mockTasks = [mockTask];
      mockPrismaService.tasks.findMany.mockResolvedValue(mockTasks);

      const result = await service.findAll(1);

      expect(prismaService.tasks.findMany).toHaveBeenCalledWith({
        where: {
          user_id: 1,
          deleted_at: null,
        },
        include: {
          priority: true,
        },
        orderBy: {
          day_to_do: 'asc',
        },
      });
      expect(result).toEqual(mockTasks);
    });

    it('should return empty array when no tasks found', async () => {
      mockPrismaService.tasks.findMany.mockResolvedValue([]);

      const result = await service.findAll(1);

      expect(result).toEqual([]);
    });

    it('should filter tasks by user_id', async () => {
      mockPrismaService.tasks.findMany.mockResolvedValue([]);

      await service.findAll(2);

      expect(prismaService.tasks.findMany).toHaveBeenCalledWith({
        where: {
          user_id: 2,
          deleted_at: null,
        },
        include: {
          priority: true,
        },
        orderBy: {
          day_to_do: 'asc',
        },
      });
    });
  });

  describe('findOne', () => {
    it('should return task when found', async () => {
      mockPrismaService.tasks.findFirst.mockResolvedValue(mockTask);

      const result = await service.findOne(1, 1);

      expect(prismaService.tasks.findFirst).toHaveBeenCalledWith({
        where: {
          id: 1,
          user_id: 1,
          deleted_at: null,
        },
        include: {
          priority: true,
        },
      });
      expect(result).toEqual(mockTask);
    });

    it('should throw NotFoundException when task not found', async () => {
      mockPrismaService.tasks.findFirst.mockResolvedValue(null);

      await expect(service.findOne(1, 999)).rejects.toThrow(
        new NotFoundException('Task não encontrada'),
      );
    });

    it('should not return task from different user', async () => {
      mockPrismaService.tasks.findFirst.mockResolvedValue(null);

      await expect(service.findOne(2, 1)).rejects.toThrow(
        new NotFoundException('Task não encontrada'),
      );

      expect(prismaService.tasks.findFirst).toHaveBeenCalledWith({
        where: {
          id: 1,
          user_id: 2,
          deleted_at: null,
        },
        include: {
          priority: true,
        },
      });
    });
  });

  describe('update', () => {
    const validUpdateDto: UpdateTaskDto = {
      title: 'Updated Task',
      description: 'Updated Description',
      completed: true,
      day_to_do: '2024-01-20',
      priority_id: 2,
    };

    it('should update task successfully', async () => {
      const updatedTask = { ...mockTask, ...validUpdateDto };
      const newPriority = { id: 2, description: 'Média' };

      mockPrismaService.tasks.findFirst.mockResolvedValue(mockTask);
      mockPrismaService.dOM_priority.findUnique.mockResolvedValue(newPriority);
      mockPrismaService.tasks.update.mockResolvedValue(updatedTask);

      const result = await service.update(1, 1, validUpdateDto);

      expect(prismaService.tasks.findFirst).toHaveBeenCalledWith({
        where: {
          id: 1,
          user_id: 1,
          deleted_at: null,
        },
        include: {
          priority: true,
        },
      });
      expect(prismaService.dOM_priority.findUnique).toHaveBeenCalledWith({
        where: { id: validUpdateDto.priority_id },
      });
      expect(prismaService.tasks.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          title: validUpdateDto.title,
          description: validUpdateDto.description,
          completed: validUpdateDto.completed,
          day_to_do: new Date(validUpdateDto.day_to_do),
          priority_id: validUpdateDto.priority_id,
        },
        include: {
          priority: true,
        },
      });
      expect(result).toEqual(updatedTask);
    });

    it('should throw NotFoundException when task not found', async () => {
      mockPrismaService.tasks.findFirst.mockResolvedValue(null);

      await expect(service.update(1, 999, validUpdateDto)).rejects.toThrow(
        new NotFoundException('Task não encontrada'),
      );

      expect(prismaService.tasks.update).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when priority does not exist', async () => {
      mockPrismaService.tasks.findFirst.mockResolvedValue(mockTask);
      mockPrismaService.dOM_priority.findUnique.mockResolvedValue(null);

      await expect(service.update(1, 1, validUpdateDto)).rejects.toThrow(
        new BadRequestException('Prioridade inválida'),
      );

      expect(prismaService.tasks.update).not.toHaveBeenCalled();
    });

    it('should update task with partial data', async () => {
      const partialUpdateDto = { title: 'New Title' };
      const updatedTask = { ...mockTask, title: 'New Title' };

      mockPrismaService.tasks.findFirst.mockResolvedValue(mockTask);
      mockPrismaService.tasks.update.mockResolvedValue(updatedTask);

      const result = await service.update(1, 1, partialUpdateDto);

      expect(prismaService.tasks.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          title: 'New Title',
        },
        include: {
          priority: true,
        },
      });
      expect(result).toEqual(updatedTask);
    });

    it('should update task without validating priority when not provided', async () => {
      const dtoWithoutPriority = { title: 'New Title', completed: true };
      const updatedTask = { ...mockTask, ...dtoWithoutPriority };

      mockPrismaService.tasks.findFirst.mockResolvedValue(mockTask);
      mockPrismaService.tasks.update.mockResolvedValue(updatedTask);

      const result = await service.update(1, 1, dtoWithoutPriority);

      expect(prismaService.dOM_priority.findUnique).not.toHaveBeenCalled();
      expect(result).toEqual(updatedTask);
    });
  });

  describe('remove', () => {
    it('should soft delete task successfully', async () => {
      const deletedTask = { ...mockTask, deleted_at: new Date() };

      mockPrismaService.tasks.findFirst.mockResolvedValue(mockTask);
      mockPrismaService.tasks.update.mockResolvedValue(deletedTask);

      const result = await service.remove(1, 1);

      expect(prismaService.tasks.findFirst).toHaveBeenCalledWith({
        where: {
          id: 1,
          user_id: 1,
          deleted_at: null,
        },
        include: {
          priority: true,
        },
      });
      expect(prismaService.tasks.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          deleted_at: expect.any(Date),
        },
      });
      expect(result).toEqual(deletedTask);
    });

    it('should throw NotFoundException when task not found', async () => {
      mockPrismaService.tasks.findFirst.mockResolvedValue(null);

      await expect(service.remove(1, 999)).rejects.toThrow(
        new NotFoundException('Task não encontrada'),
      );

      expect(prismaService.tasks.update).not.toHaveBeenCalled();
    });
  });

  describe('getPriorities', () => {
    it('should return all priorities', async () => {
      const mockPriorities = [
        { id: 1, description: 'Alta' },
        { id: 2, description: 'Média' },
        { id: 3, description: 'Baixa' },
      ];

      mockPrismaService.dOM_priority.findMany.mockResolvedValue(mockPriorities);

      const result = await service.getPriorities();

      expect(prismaService.dOM_priority.findMany).toHaveBeenCalledWith({
        orderBy: {
          id: 'asc',
        },
      });
      expect(result).toEqual(mockPriorities);
    });

    it('should return empty array when no priorities found', async () => {
      mockPrismaService.dOM_priority.findMany.mockResolvedValue([]);

      const result = await service.getPriorities();

      expect(result).toEqual([]);
    });
  });
});