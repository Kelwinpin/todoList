import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PriorityService } from './priority.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePriorityDto, UpdatePriorityDto } from './priority.dto';

describe('PriorityService', () => {
  let service: PriorityService;
  let prismaService: PrismaService;

  const mockPriority = {
    id: 1,
    description: 'Alta',
  };

  const mockTask = {
    id: 1,
    title: 'Test Task',
    priority_id: 1,
    deleted_at: null,
  };

  const mockPrismaService = {
    dOM_priority: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    tasks: {
      findFirst: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PriorityService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<PriorityService>(PriorityService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const validCreateDto: CreatePriorityDto = {
      description: 'Nova Prioridade',
    };

    it('should create a priority successfully', async () => {
      const createdPriority = { id: 2, description: 'Nova Prioridade' };
      mockPrismaService.dOM_priority.create.mockResolvedValue(createdPriority);

      const result = await service.create(validCreateDto);

      expect(prismaService.dOM_priority.create).toHaveBeenCalledWith({
        data: {
          description: validCreateDto.description,
        },
      });
      expect(result).toEqual(createdPriority);
    });

    it('should throw BadRequestException when description is missing', async () => {
      const invalidDto = { description: undefined };

      await expect(service.create(invalidDto as any)).rejects.toThrow(
        new BadRequestException('Descrição é obrigatória'),
      );

      expect(prismaService.dOM_priority.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when description is empty string', async () => {
      const invalidDto = { description: '' };

      await expect(service.create(invalidDto)).rejects.toThrow(
        new BadRequestException('Descrição é obrigatória'),
      );

      expect(prismaService.dOM_priority.create).not.toHaveBeenCalled();
    });

    it('should handle database errors during creation', async () => {
      mockPrismaService.dOM_priority.create.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(service.create(validCreateDto)).rejects.toThrow(
        'Database error',
      );
    });
  });

  describe('findAll', () => {
    it('should return all priorities', async () => {
      const mockPriorities = [
        { id: 1, description: 'Alta' },
        { id: 2, description: 'Média' },
        { id: 3, description: 'Baixa' },
      ];

      mockPrismaService.dOM_priority.findMany.mockResolvedValue(mockPriorities);

      const result = await service.findAll();

      expect(prismaService.dOM_priority.findMany).toHaveBeenCalledWith({
        orderBy: {
          id: 'asc',
        },
      });
      expect(result).toEqual(mockPriorities);
    });

    it('should return empty array when no priorities found', async () => {
      mockPrismaService.dOM_priority.findMany.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });

    it('should handle database errors during findAll', async () => {
      mockPrismaService.dOM_priority.findMany.mockRejectedValue(
        new Error('Database connection failed'),
      );

      await expect(service.findAll()).rejects.toThrow(
        'Database connection failed',
      );
    });
  });

  describe('findOne', () => {
    it('should return priority when found', async () => {
      mockPrismaService.dOM_priority.findUnique.mockResolvedValue(mockPriority);

      const result = await service.findOne(1);

      expect(prismaService.dOM_priority.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(mockPriority);
    });

    it('should throw NotFoundException when priority not found', async () => {
      mockPrismaService.dOM_priority.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(
        new NotFoundException('Prioridade não encontrada'),
      );
    });

    it('should handle different priority IDs', async () => {
      const differentPriority = { id: 5, description: 'Urgente' };
      mockPrismaService.dOM_priority.findUnique.mockResolvedValue(differentPriority);

      const result = await service.findOne(5);

      expect(prismaService.dOM_priority.findUnique).toHaveBeenCalledWith({
        where: { id: 5 },
      });
      expect(result).toEqual(differentPriority);
    });

    it('should handle database errors during findOne', async () => {
      mockPrismaService.dOM_priority.findUnique.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(service.findOne(1)).rejects.toThrow('Database error');
    });
  });

  describe('update', () => {
    const validUpdateDto: UpdatePriorityDto = {
      description: 'Prioridade Atualizada',
    };

    it('should update priority successfully', async () => {
      const updatedPriority = { ...mockPriority, ...validUpdateDto };

      mockPrismaService.dOM_priority.findUnique.mockResolvedValue(mockPriority);
      mockPrismaService.dOM_priority.update.mockResolvedValue(updatedPriority);

      const result = await service.update(1, validUpdateDto);

      expect(prismaService.dOM_priority.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(prismaService.dOM_priority.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          description: validUpdateDto.description,
        },
      });
      expect(result).toEqual(updatedPriority);
    });

    it('should throw NotFoundException when priority not found', async () => {
      mockPrismaService.dOM_priority.findUnique.mockResolvedValue(null);

      await expect(service.update(999, validUpdateDto)).rejects.toThrow(
        new NotFoundException('Prioridade não encontrada'),
      );

      expect(prismaService.dOM_priority.update).not.toHaveBeenCalled();
    });

    it('should update priority without description when not provided', async () => {
      const emptyUpdateDto = {};
      mockPrismaService.dOM_priority.findUnique.mockResolvedValue(mockPriority);
      mockPrismaService.dOM_priority.update.mockResolvedValue(mockPriority);

      const result = await service.update(1, emptyUpdateDto);

      expect(prismaService.dOM_priority.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {},
      });
      expect(result).toEqual(mockPriority);
    });

    it('should handle database errors during update', async () => {
      mockPrismaService.dOM_priority.findUnique.mockResolvedValue(mockPriority);
      mockPrismaService.dOM_priority.update.mockRejectedValue(
        new Error('Update failed'),
      );

      await expect(service.update(1, validUpdateDto)).rejects.toThrow(
        'Update failed',
      );
    });
  });

  describe('remove', () => {
    it('should remove priority successfully when no tasks use it', async () => {
      mockPrismaService.dOM_priority.findUnique.mockResolvedValue(mockPriority);
      mockPrismaService.tasks.findFirst.mockResolvedValue(null);
      mockPrismaService.dOM_priority.delete.mockResolvedValue(mockPriority);

      const result = await service.remove(1);

      expect(prismaService.dOM_priority.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(prismaService.tasks.findFirst).toHaveBeenCalledWith({
        where: {
          priority_id: 1,
          deleted_at: null,
        },
      });
      expect(prismaService.dOM_priority.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(mockPriority);
    });

    it('should throw NotFoundException when priority not found', async () => {
      mockPrismaService.dOM_priority.findUnique.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(
        new NotFoundException('Prioridade não encontrada'),
      );

      expect(prismaService.tasks.findFirst).not.toHaveBeenCalled();
      expect(prismaService.dOM_priority.delete).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when priority is being used by tasks', async () => {
      mockPrismaService.dOM_priority.findUnique.mockResolvedValue(mockPriority);
      mockPrismaService.tasks.findFirst.mockResolvedValue(mockTask);

      await expect(service.remove(1)).rejects.toThrow(
        new BadRequestException(
          'Não é possível excluir prioridade que está sendo usada por tasks',
        ),
      );

      expect(prismaService.tasks.findFirst).toHaveBeenCalledWith({
        where: {
          priority_id: 1,
          deleted_at: null,
        },
      });
      expect(prismaService.dOM_priority.delete).not.toHaveBeenCalled();
    });

    it('should allow removal when priority is used only by deleted tasks', async () => {
      const deletedTask = { ...mockTask, deleted_at: new Date() };
      mockPrismaService.dOM_priority.findUnique.mockResolvedValue(mockPriority);
      mockPrismaService.tasks.findFirst.mockResolvedValue(null); // No active tasks found
      mockPrismaService.dOM_priority.delete.mockResolvedValue(mockPriority);

      const result = await service.remove(1);

      expect(prismaService.tasks.findFirst).toHaveBeenCalledWith({
        where: {
          priority_id: 1,
          deleted_at: null, // Only checks for non-deleted tasks
        },
      });
      expect(prismaService.dOM_priority.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(mockPriority);
    });

    it('should handle database errors during removal', async () => {
      mockPrismaService.dOM_priority.findUnique.mockResolvedValue(mockPriority);
      mockPrismaService.tasks.findFirst.mockResolvedValue(null);
      mockPrismaService.dOM_priority.delete.mockRejectedValue(
        new Error('Delete failed'),
      );

      await expect(service.remove(1)).rejects.toThrow('Delete failed');
    });

    it('should handle different priority IDs for removal', async () => {
      const differentPriority = { id: 5, description: 'Test Priority' };
      mockPrismaService.dOM_priority.findUnique.mockResolvedValue(differentPriority);
      mockPrismaService.tasks.findFirst.mockResolvedValue(null);
      mockPrismaService.dOM_priority.delete.mockResolvedValue(differentPriority);

      const result = await service.remove(5);

      expect(prismaService.dOM_priority.findUnique).toHaveBeenCalledWith({
        where: { id: 5 },
      });
      expect(prismaService.tasks.findFirst).toHaveBeenCalledWith({
        where: {
          priority_id: 5,
          deleted_at: null,
        },
      });
      expect(result).toEqual(differentPriority);
    });
  });
});