import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UsersService } from './user.service';
import { PrismaService } from '../prisma/prisma.service';

describe('UsersService', () => {
  let service: UsersService;
  let prismaService: PrismaService;

  const mockUser = {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    password: 'hashedPassword',
    created_at: new Date(),
    updated_at: new Date(),
    deleted_at: null,
  };

  const mockPrismaService = {
    users: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all users that are not deleted', async () => {
      const mockUsers = [mockUser];
      mockPrismaService.users.findMany.mockResolvedValue(mockUsers);

      const result = await service.findAll();

      expect(prismaService.users.findMany).toHaveBeenCalledWith({
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
      expect(result).toEqual(mockUsers);
    });

    it('should return empty array when no users found', async () => {
      mockPrismaService.users.findMany.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findById', () => {
    it('should return user when found', async () => {
      mockPrismaService.users.findFirst.mockResolvedValue(mockUser);

      const result = await service.findById(1);

      expect(prismaService.users.findFirst).toHaveBeenCalledWith({
        where: { id: 1, deleted_at: null },
        select: {
          id: true,
          name: true,
          email: true,
          created_at: true,
          updated_at: true,
          deleted_at: true,
        },
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException when user not found', async () => {
      mockPrismaService.users.findFirst.mockResolvedValue(null);

      await expect(service.findById(999)).rejects.toThrow(
        new NotFoundException('Usuário não encontrado'),
      );
    });

    it('should throw NotFoundException when user is deleted', async () => {
      const deletedUser = { ...mockUser, deleted_at: new Date() };
      mockPrismaService.users.findFirst.mockResolvedValue(null);

      await expect(service.findById(1)).rejects.toThrow(
        new NotFoundException('Usuário não encontrado'),
      );
    });
  });

  describe('update', () => {
    it('should update user when user exists', async () => {
      const updateData = { name: 'Jane Doe', email: 'jane@example.com' };
      const updatedUser = { ...mockUser, ...updateData };

      mockPrismaService.users.findFirst.mockResolvedValue(mockUser);
      mockPrismaService.users.update.mockResolvedValue(updatedUser);

      const result = await service.update(1, updateData);

      expect(prismaService.users.findFirst).toHaveBeenCalledWith({
        where: { id: 1, deleted_at: null },
        select: {
          id: true,
          name: true,
          email: true,
          created_at: true,
          updated_at: true,
          deleted_at: true,
        },
      });
      expect(prismaService.users.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateData,
      });
      expect(result).toEqual(updatedUser);
    });

    it('should throw NotFoundException when trying to update non-existent user', async () => {
      mockPrismaService.users.findFirst.mockResolvedValue(null);

      await expect(service.update(999, { name: 'Jane Doe' })).rejects.toThrow(
        new NotFoundException('Usuário não encontrado'),
      );

      expect(prismaService.users.update).not.toHaveBeenCalled();
    });

    it('should update user with partial data', async () => {
      const updateData = { name: 'Jane Doe' };
      const updatedUser = { ...mockUser, ...updateData };

      mockPrismaService.users.findFirst.mockResolvedValue(mockUser);
      mockPrismaService.users.update.mockResolvedValue(updatedUser);

      const result = await service.update(1, updateData);

      expect(prismaService.users.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateData,
      });
      expect(result).toEqual(updatedUser);
    });
  });

  describe('softDelete', () => {
    it('should soft delete user when user exists', async () => {
      const deletedUser = { ...mockUser, deleted_at: new Date() };

      mockPrismaService.users.findFirst.mockResolvedValue(mockUser);
      mockPrismaService.users.update.mockResolvedValue(deletedUser);

      const result = await service.softDelete(1);

      expect(prismaService.users.findFirst).toHaveBeenCalledWith({
        where: { id: 1, deleted_at: null },
        select: {
          id: true,
          name: true,
          email: true,
          created_at: true,
          updated_at: true,
          deleted_at: true,
        },
      });
      expect(prismaService.users.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { deleted_at: expect.any(Date) },
      });
      expect(result).toEqual(deletedUser);
    });

    it('should throw NotFoundException when trying to delete non-existent user', async () => {
      mockPrismaService.users.findFirst.mockResolvedValue(null);

      await expect(service.softDelete(999)).rejects.toThrow(
        new NotFoundException('Usuário não encontrado'),
      );

      expect(prismaService.users.update).not.toHaveBeenCalled();
    });
  });
});
