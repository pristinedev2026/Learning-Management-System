import { ConflictException, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
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

  async getCertificateData(studentId: string, enrollmentId: string) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        course: { include: { instructor: true } },
        student: true,
      },
    });

    if (!enrollment) throw new NotFoundException('Enrollment not found.');
    if (enrollment.studentId !== studentId) throw new ConflictException('Not your enrollment.');
    if (enrollment.progressPercent < 100) {
      throw new BadRequestException('Course not completed yet.');
    }

    return {
      certificateId: enrollment.id,
      studentName: enrollment.student.name,
      courseTitle: enrollment.course.title,
      instructorName: enrollment.course.instructor.name,
      completionDate: enrollment.enrolledAt, // Using enrolledAt as a base, ideally a completedAt field exists
    };
  }
}
