import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './auth.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
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
      const expectedResult = { access_token: 'jwt-token' };
      mockAuthService.register.mockResolvedValue(expectedResult);

      const result = await controller.register(validRegisterDto);

      expect(authService.register).toHaveBeenCalledWith(validRegisterDto);
      expect(result).toEqual(expectedResult);
    });

    it('should handle registration with minimal valid data', async () => {
      const minimalDto: RegisterDto = {
        name: 'Jane',
        email: 'jane@test.com',
        password: '123456',
      };
      const expectedResult = { access_token: 'jwt-token-2' };
      mockAuthService.register.mockResolvedValue(expectedResult);

      const result = await controller.register(minimalDto);

      expect(authService.register).toHaveBeenCalledWith(minimalDto);
      expect(result).toEqual(expectedResult);
    });

    it('should throw BadRequestException when required fields are missing', async () => {
      mockAuthService.register.mockRejectedValue(
        new BadRequestException('Campos obrigatórios não informados'),
      );

      await expect(controller.register(validRegisterDto)).rejects.toThrow(
        new BadRequestException('Campos obrigatórios não informados'),
      );

      expect(authService.register).toHaveBeenCalledWith(validRegisterDto);
    });

    it('should throw ConflictException when email already exists', async () => {
      mockAuthService.register.mockRejectedValue(
        new ConflictException('Email já cadastrado'),
      );

      await expect(controller.register(validRegisterDto)).rejects.toThrow(
        new ConflictException('Email já cadastrado'),
      );

      expect(authService.register).toHaveBeenCalledWith(validRegisterDto);
    });

    it('should handle service errors during registration', async () => {
      mockAuthService.register.mockRejectedValue(new Error('Database error'));

      await expect(controller.register(validRegisterDto)).rejects.toThrow(
        'Database error',
      );

      expect(authService.register).toHaveBeenCalledWith(validRegisterDto);
    });
  });

  describe('login', () => {
    const validLoginDto: LoginDto = {
      email: 'john@example.com',
      password: 'password123',
    };

    it('should login user successfully', async () => {
      const expectedResult = { access_token: 'jwt-token' };
      mockAuthService.login.mockResolvedValue(expectedResult);

      const result = await controller.login(validLoginDto);

      expect(authService.login).toHaveBeenCalledWith(validLoginDto);
      expect(result).toEqual(expectedResult);
    });

    it('should handle login with different email formats', async () => {
      const testCases = [
        { email: 'user@domain.com', password: 'pass123' },
        { email: 'test.email@example.org', password: 'mypassword' },
        { email: 'user+tag@domain.co.uk', password: 'secure123' },
      ];

      for (const loginDto of testCases) {
        const expectedResult = { access_token: `token-${loginDto.email}` };
        mockAuthService.login.mockResolvedValue(expectedResult);

        const result = await controller.login(loginDto);

        expect(authService.login).toHaveBeenCalledWith(loginDto);
        expect(result).toEqual(expectedResult);
      }
    });

    it('should throw UnauthorizedException when credentials are invalid', async () => {
      mockAuthService.login.mockRejectedValue(
        new UnauthorizedException('Email ou senha inválidos'),
      );

      await expect(controller.login(validLoginDto)).rejects.toThrow(
        new UnauthorizedException('Email ou senha inválidos'),
      );

      expect(authService.login).toHaveBeenCalledWith(validLoginDto);
    });

    it('should throw UnauthorizedException when user not found', async () => {
      const nonExistentUserDto: LoginDto = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      mockAuthService.login.mockRejectedValue(
        new UnauthorizedException('Email ou senha inválidos'),
      );

      await expect(controller.login(nonExistentUserDto)).rejects.toThrow(
        new UnauthorizedException('Email ou senha inválidos'),
      );

      expect(authService.login).toHaveBeenCalledWith(nonExistentUserDto);
    });

    it('should throw UnauthorizedException when password is wrong', async () => {
      const wrongPasswordDto: LoginDto = {
        email: 'john@example.com',
        password: 'wrongpassword',
      };

      mockAuthService.login.mockRejectedValue(
        new UnauthorizedException('Email ou senha inválidos'),
      );

      await expect(controller.login(wrongPasswordDto)).rejects.toThrow(
        new UnauthorizedException('Email ou senha inválidos'),
      );

      expect(authService.login).toHaveBeenCalledWith(wrongPasswordDto);
    });

    it('should handle service errors during login', async () => {
      mockAuthService.login.mockRejectedValue(
        new Error('Database connection failed'),
      );

      await expect(controller.login(validLoginDto)).rejects.toThrow(
        'Database connection failed',
      );

      expect(authService.login).toHaveBeenCalledWith(validLoginDto);
    });
  });
});
