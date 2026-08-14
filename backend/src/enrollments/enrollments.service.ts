import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EnrollmentsService {
  constructor(private prisma: PrismaService) {}

  async myEnrollments(studentId: string) {
    return this.prisma.enrollment.findMany({ where: { studentId } });
  }

  async enroll(studentId: string, courseId: string) {
    const existing = await this.prisma.enrollment.findUnique({
      where: { studentId_courseId: { studentId, courseId } },
    });
    if (existing) {
      throw new ConflictException('Already enrolled in this course.');
    }
    return this.prisma.enrollment.create({
      data: { studentId, courseId, status: 'active', progressPercent: 0 },
    });
  }
}
