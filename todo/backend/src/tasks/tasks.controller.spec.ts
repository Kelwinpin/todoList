import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskDto } from './tasks.dto';

describe('TasksController', () => {
  let controller: TasksController;
  let tasksService: TasksService;

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

  const mockRequest = {
    user: {
      userId: 1,
    },
  };

  const mockTasksService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    getPriorities: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [
        {
          provide: TasksService,
          useValue: mockTasksService,
        },
      ],
    }).compile();

    controller = module.get<TasksController>(TasksController);
    tasksService = module.get<TasksService>(TasksService);
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
      mockTasksService.create.mockResolvedValue(mockTask);

      const result = await controller.create(mockRequest, validCreateDto);

      expect(tasksService.create).toHaveBeenCalledWith(1, validCreateDto);
      expect(result).toEqual(mockTask);
    });

    it('should handle creation with minimal data', async () => {
      const minimalDto: CreateTaskDto = {
        title: 'Simple Task',
        day_to_do: '2024-01-20',
        priority_id: 2,
      };

      mockTasksService.create.mockResolvedValue({
        ...mockTask,
        ...minimalDto,
        description: null,
      });

      const result = await controller.create(mockRequest, minimalDto);

      expect(tasksService.create).toHaveBeenCalledWith(1, minimalDto);
      expect(result).toEqual({
        ...mockTask,
        ...minimalDto,
        description: null,
      });
    });

    it('should throw BadRequestException when required fields are missing', async () => {
      mockTasksService.create.mockRejectedValue(
        new BadRequestException('Campos obrigatórios não informados'),
      );

      await expect(controller.create(mockRequest, validCreateDto)).rejects.toThrow(
        new BadRequestException('Campos obrigatórios não informados'),
      );

      expect(tasksService.create).toHaveBeenCalledWith(1, validCreateDto);
    });

    it('should throw BadRequestException when priority is invalid', async () => {
      mockTasksService.create.mockRejectedValue(
        new BadRequestException('Prioridade inválida'),
      );

      await expect(controller.create(mockRequest, validCreateDto)).rejects.toThrow(
        new BadRequestException('Prioridade inválida'),
      );

      expect(tasksService.create).toHaveBeenCalledWith(1, validCreateDto);
    });

    it('should extract userId from request correctly', async () => {
      const differentRequest = { user: { userId: 5 } };
      mockTasksService.create.mockResolvedValue(mockTask);

      await controller.create(differentRequest, validCreateDto);

      expect(tasksService.create).toHaveBeenCalledWith(5, validCreateDto);
    });
  });

  describe('findAll', () => {
    it('should return all tasks for user', async () => {
      const mockTasks = [mockTask];
      mockTasksService.findAll.mockResolvedValue(mockTasks);

      const result = await controller.findAll(mockRequest);

      expect(tasksService.findAll).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockTasks);
    });

    it('should return empty array when no tasks found', async () => {
      mockTasksService.findAll.mockResolvedValue([]);

      const result = await controller.findAll(mockRequest);

      expect(result).toEqual([]);
    });

    it('should use correct userId from request', async () => {
      const differentRequest = { user: { userId: 3 } };
      mockTasksService.findAll.mockResolvedValue([]);

      await controller.findAll(differentRequest);

      expect(tasksService.findAll).toHaveBeenCalledWith(3);
    });
  });

  describe('getPriorities', () => {
    it('should return all priorities', async () => {
      const mockPriorities = [
        { id: 1, description: 'Alta' },
        { id: 2, description: 'Média' },
        { id: 3, description: 'Baixa' },
      ];

      mockTasksService.getPriorities.mockResolvedValue(mockPriorities);

      const result = await controller.getPriorities();

      expect(tasksService.getPriorities).toHaveBeenCalled();
      expect(result).toEqual(mockPriorities);
    });

    it('should return empty array when no priorities found', async () => {
      mockTasksService.getPriorities.mockResolvedValue([]);

      const result = await controller.getPriorities();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return task by id', async () => {
      mockTasksService.findOne.mockResolvedValue(mockTask);

      const result = await controller.findOne(mockRequest, 1);

      expect(tasksService.findOne).toHaveBeenCalledWith(1, 1);
      expect(result).toEqual(mockTask);
    });

    it('should throw NotFoundException when task not found', async () => {
      mockTasksService.findOne.mockRejectedValue(
        new NotFoundException('Task não encontrada'),
      );

      await expect(controller.findOne(mockRequest, 999)).rejects.toThrow(
        new NotFoundException('Task não encontrada'),
      );
    });

    it('should parse id parameter correctly', async () => {
      mockTasksService.findOne.mockResolvedValue(mockTask);

      await controller.findOne(mockRequest, 5);

      expect(tasksService.findOne).toHaveBeenCalledWith(1, 5);
    });

    it('should use correct userId from request', async () => {
      const differentRequest = { user: { userId: 7 } };
      mockTasksService.findOne.mockResolvedValue(mockTask);

      await controller.findOne(differentRequest, 1);

      expect(tasksService.findOne).toHaveBeenCalledWith(7, 1);
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
      mockTasksService.update.mockResolvedValue(updatedTask);

      const result = await controller.update(mockRequest, 1, validUpdateDto);

      expect(tasksService.update).toHaveBeenCalledWith(1, 1, validUpdateDto);
      expect(result).toEqual(updatedTask);
    });

    it('should update task with partial data', async () => {
      const partialUpdateDto = { title: 'New Title' };
      const updatedTask = { ...mockTask, title: 'New Title' };

      mockTasksService.update.mockResolvedValue(updatedTask);

      const result = await controller.update(mockRequest, 1, partialUpdateDto);

      expect(tasksService.update).toHaveBeenCalledWith(1, 1, partialUpdateDto);
      expect(result).toEqual(updatedTask);
    });

    it('should throw NotFoundException when task not found', async () => {
      mockTasksService.update.mockRejectedValue(
        new NotFoundException('Task não encontrada'),
      );

      await expect(
        controller.update(mockRequest, 999, validUpdateDto),
      ).rejects.toThrow(new NotFoundException('Task não encontrada'));
    });

    it('should throw BadRequestException when priority is invalid', async () => {
      mockTasksService.update.mockRejectedValue(
        new BadRequestException('Prioridade inválida'),
      );

      await expect(
        controller.update(mockRequest, 1, validUpdateDto),
      ).rejects.toThrow(new BadRequestException('Prioridade inválida'));
    });

    it('should handle different user IDs and task IDs', async () => {
      const differentRequest = { user: { userId: 10 } };
      const updatedTask = { ...mockTask, ...validUpdateDto };

      mockTasksService.update.mockResolvedValue(updatedTask);

      await controller.update(differentRequest, 5, validUpdateDto);

      expect(tasksService.update).toHaveBeenCalledWith(10, 5, validUpdateDto);
    });

    it('should handle empty update data', async () => {
      const emptyUpdateDto = {};
      mockTasksService.update.mockResolvedValue(mockTask);

      const result = await controller.update(mockRequest, 1, emptyUpdateDto);

      expect(tasksService.update).toHaveBeenCalledWith(1, 1, emptyUpdateDto);
      expect(result).toEqual(mockTask);
    });
  });

  describe('remove', () => {
    it('should remove task successfully', async () => {
      const deletedTask = { ...mockTask, deleted_at: new Date() };
      mockTasksService.remove.mockResolvedValue(deletedTask);

      const result = await controller.remove(mockRequest, 1);

      expect(tasksService.remove).toHaveBeenCalledWith(1, 1);
      expect(result).toEqual(deletedTask);
    });

    it('should throw NotFoundException when task not found', async () => {
      mockTasksService.remove.mockRejectedValue(
        new NotFoundException('Task não encontrada'),
      );

      await expect(controller.remove(mockRequest, 999)).rejects.toThrow(
        new NotFoundException('Task não encontrada'),
      );
    });

    it('should parse id parameter correctly for deletion', async () => {
      const deletedTask = { ...mockTask, deleted_at: new Date() };
      mockTasksService.remove.mockResolvedValue(deletedTask);

      await controller.remove(mockRequest, 3);

      expect(tasksService.remove).toHaveBeenCalledWith(1, 3);
    });

    it('should use correct userId from request for deletion', async () => {
      const differentRequest = { user: { userId: 8 } };
      const deletedTask = { ...mockTask, deleted_at: new Date() };

      mockTasksService.remove.mockResolvedValue(deletedTask);

      await controller.remove(differentRequest, 1);

      expect(tasksService.remove).toHaveBeenCalledWith(8, 1);
    });
  });
});