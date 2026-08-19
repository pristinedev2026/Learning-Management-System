import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { GamificationService } from '../../gamification/gamification.service';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mock_token'),
  };

  const mockGamificationService = {
    updateStreak: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: GamificationService, useValue: mockGamificationService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('signUp', () => {
    it('should create a new user', async () => {
      const dto = { name: 'Test', phone: '1234567890', password: 'password', role: 'student' };
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue({
        id: '1',
        ...dto,
        passwordHash: 'hashed',
        avatarUrl: null,
        email: null,
        mustChangePassword: false,
      });

      const result = await service.signUp(dto as any);

      expect(result.accessToken).toBe('mock_token');
      expect(result.user.name).toBe('Test');
      expect(mockPrismaService.user.create).toHaveBeenCalled();
    });

    it('should throw if phone already exists', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({ id: '1' });
      await expect(service.signUp({ phone: '123' } as any)).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should return user and token if credentials correct', async () => {
      const user = {
        id: '1',
        phone: '123',
        passwordHash: await bcrypt.hash('pass', 10),
        name: 'Test',
        role: 'student',
        avatarUrl: null,
        email: null,
        mustChangePassword: false,
      };
      mockPrismaService.user.findUnique.mockResolvedValue(user);

      const result = await service.login({ phone: '123', password: 'pass' });

      expect(result.accessToken).toBe('mock_token');
      expect(mockGamificationService.updateStreak).toHaveBeenCalledWith('1');
    });

    it('should throw if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      await expect(service.login({ phone: '123', password: 'p' })).rejects.toThrow(UnauthorizedException);
    });
  });
});
