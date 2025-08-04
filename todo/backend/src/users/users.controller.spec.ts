import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './user.service';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: UsersService;

  const mockUser = {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    created_at: new Date(),
    updated_at: new Date(),
    deleted_at: null,
  };

  const mockUsersService = {
    findAll: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const mockUsers = [mockUser];
      mockUsersService.findAll.mockResolvedValue(mockUsers);

      const result = await controller.findAll();

      expect(usersService.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockUsers);
    });

    it('should return empty array when no users found', async () => {
      mockUsersService.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findById', () => {
    it('should return user by id', async () => {
      mockUsersService.findById.mockResolvedValue(mockUser);

      const result = await controller.findById(1);

      expect(usersService.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException when user not found', async () => {
      mockUsersService.findById.mockRejectedValue(
        new NotFoundException('Usuário não encontrado'),
      );

      await expect(controller.findById(999)).rejects.toThrow(
        new NotFoundException('Usuário não encontrado'),
      );
    });

    it('should parse id parameter correctly', async () => {
      mockUsersService.findById.mockResolvedValue(mockUser);

      await controller.findById(1);

      expect(usersService.findById).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    it('should update user with valid data', async () => {
      const updateData = { name: 'Jane Doe', email: 'jane@example.com' };
      const updatedUser = { ...mockUser, ...updateData };

      mockUsersService.update.mockResolvedValue(updatedUser);

      const result = await controller.update(1, updateData);

      expect(usersService.update).toHaveBeenCalledWith(1, updateData);
      expect(result).toEqual(updatedUser);
    });

    it('should update user with partial data', async () => {
      const updateData = { name: 'Jane Doe' };
      const updatedUser = { ...mockUser, ...updateData };

      mockUsersService.update.mockResolvedValue(updatedUser);

      const result = await controller.update(1, updateData);

      expect(usersService.update).toHaveBeenCalledWith(1, updateData);
      expect(result).toEqual(updatedUser);
    });

    it('should update user with email only', async () => {
      const updateData = { email: 'newemail@example.com' };
      const updatedUser = { ...mockUser, ...updateData };

      mockUsersService.update.mockResolvedValue(updatedUser);

      const result = await controller.update(1, updateData);

      expect(usersService.update).toHaveBeenCalledWith(1, updateData);
      expect(result).toEqual(updatedUser);
    });

    it('should throw NotFoundException when trying to update non-existent user', async () => {
      const updateData = { name: 'Jane Doe' };
      mockUsersService.update.mockRejectedValue(
        new NotFoundException('Usuário não encontrado'),
      );

      await expect(controller.update(999, updateData)).rejects.toThrow(
        new NotFoundException('Usuário não encontrado'),
      );
    });

    it('should handle empty update data', async () => {
      const updateData = {};
      mockUsersService.update.mockResolvedValue(mockUser);

      const result = await controller.update(1, updateData);

      expect(usersService.update).toHaveBeenCalledWith(1, updateData);
      expect(result).toEqual(mockUser);
    });
  });

  describe('softDelete', () => {
    it('should soft delete user', async () => {
      const deletedUser = { ...mockUser, deleted_at: new Date() };
      mockUsersService.softDelete.mockResolvedValue(deletedUser);

      const result = await controller.softDelete(1);

      expect(usersService.softDelete).toHaveBeenCalledWith(1);
      expect(result).toEqual(deletedUser);
    });

    it('should throw NotFoundException when trying to delete non-existent user', async () => {
      mockUsersService.softDelete.mockRejectedValue(
        new NotFoundException('Usuário não encontrado'),
      );

      await expect(controller.softDelete(999)).rejects.toThrow(
        new NotFoundException('Usuário não encontrado'),
      );
    });

    it('should parse id parameter correctly for deletion', async () => {
      const deletedUser = { ...mockUser, deleted_at: new Date() };
      mockUsersService.softDelete.mockResolvedValue(deletedUser);

      await controller.softDelete(1);

      expect(usersService.softDelete).toHaveBeenCalledWith(1);
    });
  });
});
