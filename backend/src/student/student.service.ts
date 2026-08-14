import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StudentService {
  constructor(private prisma: PrismaService) {}

  async getGrades(userId: string) {
    const enrollments = await this.prisma.enrollment.findMany({
      where: { studentId: userId },
      include: {
        course: {
          include: {
            assignments: {
              include: {
                submissions: {
                  where: { studentId: userId },
                },
              },
            },
            quizzes: {
              include: {
                attempts: {
                  where: { studentId: userId },
                },
              },
            },
          },
        },
      },
    });

    return enrollments.map((e) => e.course);
  }

  async getCalendar(userId: string) {
    const enrollments = await this.prisma.enrollment.findMany({
      where: { studentId: userId },
      select: { courseId: true },
    });

    const courseIds = enrollments.map((e) => e.courseId);

    const assignments = await this.prisma.assignment.findMany({
      where: {
        courseId: { in: courseIds },
        dueDate: { gte: new Date() },
      },
      include: { course: { select: { title: true } } },
    });

    const quizzes = await this.prisma.quiz.findMany({
      where: {
        courseId: { in: courseIds },
        dueDate: { gte: new Date() },
      },
      include: { course: { select: { title: true } } },
    });

    const calendarItems = [
      ...assignments.map((a) => ({
        id: a.id,
        type: 'assignment',
        title: a.title,
        dueDate: a.dueDate,
        courseTitle: a.course.title,
      })),
      ...quizzes.map((q) => ({
        id: q.id,
        type: 'quiz',
        title: q.title,
        dueDate: q.dueDate,
        courseTitle: q.course.title,
      })),
    ];

    return calendarItems.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
  }

  async getNotifications(userId: string) {
    return this.prisma.appNotification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
