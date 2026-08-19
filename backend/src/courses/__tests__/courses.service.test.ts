import { Test, TestingModule } from '@nestjs/testing';
import { CoursesService } from '../courses.service';
import { PrismaService } from '../../prisma/prisma.service';
import { GamificationService } from '../../gamification/gamification.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('CoursesService', () => {
  let service: CoursesService;
  let prisma: PrismaService;

  const mockPrismaService = {
    course: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    module: { create: jest.fn(), findUnique: jest.fn() },
    lesson: { create: jest.fn(), findUnique: jest.fn() },
    lessonCompletion: { findUnique: jest.fn(), create: jest.fn(), delete: jest.fn() },
    enrollment: { update: jest.fn() },
    submission: { count: jest.fn() },
  };

  const mockGamificationService = {
    awardBadge: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoursesService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: GamificationService, useValue: mockGamificationService },
      ],
    }).compile();

    service = module.get<CoursesService>(CoursesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('catalog', () => {
    it('should return serialized courses', async () => {
      const mockCourses = [
        {
          id: '1',
          title: 'Course 1',
          instructor: { name: 'Dr. Test' },
          modules: [],
          _count: { enrollments: 5 },
          category: 'CS',
          syllabus: '...',
          description: '...',
          instructorId: 'inst1',
        },
      ];
      mockPrismaService.course.findMany.mockResolvedValue(mockCourses);

      const result = await service.catalog();

      expect(result).toHaveLength(1);
      expect(result[0].instructorName).toBe('Dr. Test');
      expect(result[0].studentCount).toBe(5);
    });
  });

  describe('findById', () => {
    it('should throw if course not found', async () => {
      mockPrismaService.course.findUnique.mockResolvedValue(null);
      await expect(service.findById('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a course', async () => {
      const dto = { title: 'New', description: 'Desc', syllabus: '...', category: 'Gen' };
      mockPrismaService.course.create.mockResolvedValue({
        id: 'c1',
        ...dto,
        instructor: { name: 'Inst' },
        instructorId: 'inst1',
      });

      const result = await service.create('inst1', dto);
      expect(result.id).toBe('c1');
      expect(mockPrismaService.course.create).toHaveBeenCalled();
    });
  });
});
