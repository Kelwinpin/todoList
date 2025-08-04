import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import {
  ConflictException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto } from './auth.dto';

// Mock bcrypt
jest.mock('bcrypt');
const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;

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
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    const validRegisterDto: RegisterDto = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
    };

    it('should register a new user successfully', async () => {
      const hashedPassword = 'hashedPassword123';
      mockPrismaService.users.findUnique.mockResolvedValue(null);
      mockBcrypt.hash.mockResolvedValue(hashedPassword as never);
      mockPrismaService.users.create.mockResolvedValue(mockUser);
      mockJwtService.signAsync.mockResolvedValue('jwt-token');

      const result = await service.register(validRegisterDto);

      expect(prismaService.users.findUnique).toHaveBeenCalledWith({
        where: { email: validRegisterDto.email },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(validRegisterDto.password, 10);
      expect(prismaService.users.create).toHaveBeenCalledWith({
        data: {
          email: validRegisterDto.email,
          password: hashedPassword,
          name: validRegisterDto.name,
        },
      });
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
      });
      expect(result).toEqual({ access_token: 'jwt-token' });
    });

    it('should throw BadRequestException when name is undefined', async () => {
      const invalidDto = { ...validRegisterDto, name: undefined };

      await expect(service.register(invalidDto as any)).rejects.toThrow(
        new BadRequestException('Campos obrigatórios não informados'),
      );

      expect(prismaService.users.findUnique).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when email is undefined', async () => {
      const invalidDto = { ...validRegisterDto, email: undefined };

      await expect(service.register(invalidDto as any)).rejects.toThrow(
        new BadRequestException('Campos obrigatórios não informados'),
      );

      expect(prismaService.users.findUnique).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when password is undefined', async () => {
      const invalidDto = { ...validRegisterDto, password: undefined };

      await expect(service.register(invalidDto as any)).rejects.toThrow(
        new BadRequestException('Campos obrigatórios não informados'),
      );

      expect(prismaService.users.findUnique).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when email already exists', async () => {
      mockPrismaService.users.findUnique.mockResolvedValue(mockUser);

      await expect(service.register(validRegisterDto)).rejects.toThrow(
        new ConflictException('Email já cadastrado'),
      );

      expect(prismaService.users.findUnique).toHaveBeenCalledWith({
        where: { email: validRegisterDto.email },
      });
      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(prismaService.users.create).not.toHaveBeenCalled();
    });

    it('should handle bcrypt hash error', async () => {
      mockPrismaService.users.findUnique.mockResolvedValue(null);
      mockBcrypt.hash.mockRejectedValue(new Error('Hash error'));

      await expect(service.register(validRegisterDto)).rejects.toThrow(
        'Hash error',
      );

      expect(prismaService.users.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    const validLoginDto: LoginDto = {
      email: 'john@example.com',
      password: 'password123',
    };

    it('should login user successfully', async () => {
      mockPrismaService.users.findUnique.mockResolvedValue(mockUser);
      mockBcrypt.compare.mockResolvedValue(true as never);
      mockJwtService.signAsync.mockResolvedValue('jwt-token');

      const result = await service.login(validLoginDto);

      expect(prismaService.users.findUnique).toHaveBeenCalledWith({
        where: { email: validLoginDto.email },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        validLoginDto.password,
        mockUser.password,
      );
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
      });
      expect(result).toEqual({ access_token: 'jwt-token' });
    });

    it('should throw UnauthorizedException when user not found', async () => {
      mockPrismaService.users.findUnique.mockResolvedValue(null);

      await expect(service.login(validLoginDto)).rejects.toThrow(
        new UnauthorizedException('Email ou senha inválidos'),
      );

      expect(prismaService.users.findUnique).toHaveBeenCalledWith({
        where: { email: validLoginDto.email },
      });
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when password is incorrect', async () => {
      mockPrismaService.users.findUnique.mockResolvedValue(mockUser);
      mockBcrypt.compare.mockResolvedValue(false as never);

      await expect(service.login(validLoginDto)).rejects.toThrow(
        new UnauthorizedException('Email ou senha inválidos'),
      );

      expect(prismaService.users.findUnique).toHaveBeenCalledWith({
        where: { email: validLoginDto.email },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        validLoginDto.password,
        mockUser.password,
      );
      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });

    it('should handle bcrypt compare error', async () => {
      mockPrismaService.users.findUnique.mockResolvedValue(mockUser);
      mockBcrypt.compare.mockRejectedValue(new Error('Compare error'));

      await expect(service.login(validLoginDto)).rejects.toThrow(
        'Compare error',
      );

      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });
  });

  describe('signToken', () => {
    it('should generate JWT token with correct payload', async () => {
      const userId = 1;
      const email = 'john@example.com';
      const expectedToken = 'jwt-token';

      mockJwtService.signAsync.mockResolvedValue(expectedToken);

      const result = await service.signToken(userId, email);

      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: userId,
        email: email,
      });
      expect(result).toEqual({ access_token: expectedToken });
    });

    it('should handle JWT service error', async () => {
      const userId = 1;
      const email = 'john@example.com';

      mockJwtService.signAsync.mockRejectedValue(new Error('JWT error'));

      await expect(service.signToken(userId, email)).rejects.toThrow(
        'JWT error',
      );
    });

    it('should work with different user IDs and emails', async () => {
      const testCases = [
        { userId: 1, email: 'user1@example.com' },
        { userId: 999, email: 'user999@example.com' },
        { userId: 42, email: 'test@domain.org' },
      ];

      for (const { userId, email } of testCases) {
        mockJwtService.signAsync.mockResolvedValue(`token-${userId}`);

        const result = await service.signToken(userId, email);

        expect(jwtService.signAsync).toHaveBeenCalledWith({
          sub: userId,
          email: email,
        });
        expect(result).toEqual({ access_token: `token-${userId}` });
      }
    });
  });
});
