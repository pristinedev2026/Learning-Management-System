import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async forCourse(courseId: string) {
    return this.prisma.review.findMany({
      where: { courseId },
      include: { student: { select: { id: true, name: true, avatarUrl: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(studentId: string, courseId: string, rating: number, comment?: string) {
    // Check if enrolled
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { studentId_courseId: { studentId, courseId } },
    });
    if (!enrollment) throw new NotFoundException('You must be enrolled to review this course.');

    const existing = await this.prisma.review.findUnique({
      where: { studentId_courseId: { studentId, courseId } },
    });
    if (existing) throw new ConflictException('You have already reviewed this course.');

    return this.prisma.review.create({
      data: { studentId, courseId, rating, comment },
    });
  }

  async getAverageRating(courseId: string) {
    const aggregate = await this.prisma.review.aggregate({
      where: { courseId },
      _avg: { rating: true },
      _count: { rating: true },
    });
    return {
      averageRating: aggregate._avg.rating || 0,
      reviewCount: aggregate._count.rating || 0,
    };
  }
}
