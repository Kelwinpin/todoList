import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PriorityController } from './priority.controller';
import { PriorityService } from './priority.service';
import { CreatePriorityDto, UpdatePriorityDto } from './priority.dto';

describe('PriorityController', () => {
  let controller: PriorityController;
  let priorityService: PriorityService;

  const mockPriority = {
    id: 1,
    description: 'Alta',
  };

  const mockPriorityService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PriorityController],
      providers: [
        {
          provide: PriorityService,
          useValue: mockPriorityService,
        },
      ],
    }).compile();

    controller = module.get<PriorityController>(PriorityController);
    priorityService = module.get<PriorityService>(PriorityService);
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
      mockPriorityService.create.mockResolvedValue(createdPriority);

      const result = await controller.create(validCreateDto);

      expect(priorityService.create).toHaveBeenCalledWith(validCreateDto);
      expect(result).toEqual(createdPriority);
    });

    it('should handle creation with different descriptions', async () => {
      const testCases = [
        { description: 'Urgente' },
        { description: 'Muito Alta' },
        { description: 'Crítica' },
      ];

      for (const dto of testCases) {
        const expectedResult = { id: Math.random(), description: dto.description };
        mockPriorityService.create.mockResolvedValue(expectedResult);

        const result = await controller.create(dto);

        expect(priorityService.create).toHaveBeenCalledWith(dto);
        expect(result).toEqual(expectedResult);
      }
    });

    it('should throw BadRequestException when description is missing', async () => {
      mockPriorityService.create.mockRejectedValue(
        new BadRequestException('Descrição é obrigatória'),
      );

      await expect(controller.create(validCreateDto)).rejects.toThrow(
        new BadRequestException('Descrição é obrigatória'),
      );

      expect(priorityService.create).toHaveBeenCalledWith(validCreateDto);
    });

    it('should handle service errors during creation', async () => {
      mockPriorityService.create.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(controller.create(validCreateDto)).rejects.toThrow(
        'Database error',
      );

      expect(priorityService.create).toHaveBeenCalledWith(validCreateDto);
    });
  });

  describe('findAll', () => {
    it('should return all priorities', async () => {
      const mockPriorities = [
        { id: 1, description: 'Alta' },
        { id: 2, description: 'Média' },
        { id: 3, description: 'Baixa' },
      ];

      mockPriorityService.findAll.mockResolvedValue(mockPriorities);

      const result = await controller.findAll();

      expect(priorityService.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockPriorities);
    });

    it('should return empty array when no priorities found', async () => {
      mockPriorityService.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
    });

    it('should handle service errors during findAll', async () => {
      mockPriorityService.findAll.mockRejectedValue(
        new Error('Database connection failed'),
      );

      await expect(controller.findAll()).rejects.toThrow(
        'Database connection failed',
      );
    });
  });

  describe('findOne', () => {
    it('should return priority by id', async () => {
      mockPriorityService.findOne.mockResolvedValue(mockPriority);

      const result = await controller.findOne(1);

      expect(priorityService.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockPriority);
    });

    it('should throw NotFoundException when priority not found', async () => {
      mockPriorityService.findOne.mockRejectedValue(
        new NotFoundException('Prioridade não encontrada'),
      );

      await expect(controller.findOne(999)).rejects.toThrow(
        new NotFoundException('Prioridade não encontrada'),
      );
    });

    it('should parse id parameter correctly', async () => {
      mockPriorityService.findOne.mockResolvedValue(mockPriority);

      await controller.findOne(5);

      expect(priorityService.findOne).toHaveBeenCalledWith(5);
    });

    it('should handle different priority IDs', async () => {
      const testIds = [1, 10, 999];

      for (const id of testIds) {
        const expectedPriority = { id, description: `Priority ${id}` };
        mockPriorityService.findOne.mockResolvedValue(expectedPriority);

        const result = await controller.findOne(id);

        expect(priorityService.findOne).toHaveBeenCalledWith(id);
        expect(result).toEqual(expectedPriority);
      }
    });
  });

  describe('update', () => {
    const validUpdateDto: UpdatePriorityDto = {
      description: 'Prioridade Atualizada',
    };

    it('should update priority successfully', async () => {
      const updatedPriority = { ...mockPriority, ...validUpdateDto };
      mockPriorityService.update.mockResolvedValue(updatedPriority);

      const result = await controller.update(1, validUpdateDto);

      expect(priorityService.update).toHaveBeenCalledWith(1, validUpdateDto);
      expect(result).toEqual(updatedPriority);
    });

    it('should update priority with partial data', async () => {
      const partialUpdateDto = { description: 'Parcial' };
      const updatedPriority = { ...mockPriority, description: 'Parcial' };

      mockPriorityService.update.mockResolvedValue(updatedPriority);

      const result = await controller.update(1, partialUpdateDto);

      expect(priorityService.update).toHaveBeenCalledWith(1, partialUpdateDto);
      expect(result).toEqual(updatedPriority);
    });

    it('should throw NotFoundException when priority not found', async () => {
      mockPriorityService.update.mockRejectedValue(
        new NotFoundException('Prioridade não encontrada'),
      );

      await expect(controller.update(999, validUpdateDto)).rejects.toThrow(
        new NotFoundException('Prioridade não encontrada'),
      );
    });

    it('should handle empty update data', async () => {
      const emptyUpdateDto = {};
      mockPriorityService.update.mockResolvedValue(mockPriority);

      const result = await controller.update(1, emptyUpdateDto);

      expect(priorityService.update).toHaveBeenCalledWith(1, emptyUpdateDto);
      expect(result).toEqual(mockPriority);
    });

    it('should handle different priority IDs and update data', async () => {
      const testCases = [
        { id: 1, dto: { description: 'Atualizada 1' } },
        { id: 5, dto: { description: 'Atualizada 2' } },
        { id: 10, dto: { description: 'Atualizada 3' } },
      ];

      for (const { id, dto } of testCases) {
        const expectedResult = { id, description: dto.description };
        mockPriorityService.update.mockResolvedValue(expectedResult);

        const result = await controller.update(id, dto);

        expect(priorityService.update).toHaveBeenCalledWith(id, dto);
        expect(result).toEqual(expectedResult);
      }
    });

    it('should handle service errors during update', async () => {
      mockPriorityService.update.mockRejectedValue(
        new Error('Update failed'),
      );

      await expect(controller.update(1, validUpdateDto)).rejects.toThrow(
        'Update failed',
      );
    });
  });

  describe('remove', () => {
    it('should remove priority successfully', async () => {
      mockPriorityService.remove.mockResolvedValue(mockPriority);

      const result = await controller.remove(1);

      expect(priorityService.remove).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockPriority);
    });

    it('should throw NotFoundException when priority not found', async () => {
      mockPriorityService.remove.mockRejectedValue(
        new NotFoundException('Prioridade não encontrada'),
      );

      await expect(controller.remove(999)).rejects.toThrow(
        new NotFoundException('Prioridade não encontrada'),
      );
    });

    it('should throw BadRequestException when priority is being used', async () => {
      mockPriorityService.remove.mockRejectedValue(
        new BadRequestException(
          'Não é possível excluir prioridade que está sendo usada por tasks',
        ),
      );

      await expect(controller.remove(1)).rejects.toThrow(
        new BadRequestException(
          'Não é possível excluir prioridade que está sendo usada por tasks',
        ),
      );
    });

    it('should parse id parameter correctly for deletion', async () => {
      mockPriorityService.remove.mockResolvedValue(mockPriority);

      await controller.remove(3);

      expect(priorityService.remove).toHaveBeenCalledWith(3);
    });

    it('should handle different priority IDs for deletion', async () => {
      const testIds = [1, 7, 15];

      for (const id of testIds) {
        const expectedResult = { id, description: `Priority ${id}` };
        mockPriorityService.remove.mockResolvedValue(expectedResult);

        const result = await controller.remove(id);

        expect(priorityService.remove).toHaveBeenCalledWith(id);
        expect(result).toEqual(expectedResult);
      }
    });

    it('should handle service errors during removal', async () => {
      mockPriorityService.remove.mockRejectedValue(
        new Error('Delete failed'),
      );

      await expect(controller.remove(1)).rejects.toThrow('Delete failed');
    });
  });
});