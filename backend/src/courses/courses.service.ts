import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateCourseDto, CreateLessonDto, CreateModuleDto, UpdateCourseDto } from './dto/course.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class CoursesService {
  constructor(private prisma: PrismaService) {}

  private getCourseInclude(studentId?: string): Prisma.CourseInclude {
    return {
      instructor: true,
      modules: {
        orderBy: { order: 'asc' as const },
        include: {
          lessons: {
            orderBy: { order: 'asc' as const },
            include: studentId
              ? {
                  completions: {
                    where: { studentId },
                  },
                }
              : undefined,
          },
        },
      },
      _count: { select: { enrollments: true } },
    };
  }

  private serialize(course: any) {
    return {
      id: course.id,
      title: course.title,
      description: course.description,
      instructorId: course.instructorId,
      instructorName: course.instructor.name,
      coverImageUrl: course.coverImageUrl ?? undefined,
      syllabus: course.syllabus,
      category: course.category,
      studentCount: course._count?.enrollments ?? 0,
      modules: (course.modules ?? []).map((m: any) => ({
        id: m.id,
        courseId: course.id,
        title: m.title,
        order: m.order,
        lessons: (m.lessons ?? []).map((l: any) => ({
          id: l.id,
          moduleId: m.id,
          type: l.type,
          order: l.order,
          title: l.title,
          content: l.content,
          durationMinutes: l.durationMinutes ?? undefined,
          completed: (l.completions ?? []).length > 0,
        })),
      })),
    };
  }

  async catalog(search?: string) {
    const courses = await this.prisma.course.findMany({
      where: search
        ? {
            OR: [
              { title: { contains: search, mode: 'insensitive' } },
              { category: { contains: search, mode: 'insensitive' } },
            ],
          }
        : undefined,
      include: this.getCourseInclude(),
      orderBy: { createdAt: 'desc' },
    });
    return courses.map((c) => this.serialize(c));
  }

  async findById(id: string, studentId?: string) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: this.getCourseInclude(studentId),
    });
    if (!course) throw new NotFoundException('Course not found.');
    return this.serialize(course);
  }

  async byInstructor(instructorId: string) {
    const courses = await this.prisma.course.findMany({
      where: { instructorId },
      include: this.getCourseInclude(),
      orderBy: { createdAt: 'desc' },
    });
    return courses.map((c) => this.serialize(c));
  }

  async create(instructorId: string, dto: CreateCourseDto) {
    const course = await this.prisma.course.create({
      data: { ...dto, instructorId },
      include: this.getCourseInclude(),
    });
    return this.serialize(course);
  }

  async update(instructorId: string, courseId: string, dto: UpdateCourseDto) {
    await this.assertOwnership(instructorId, courseId);
    const course = await this.prisma.course.update({
      where: { id: courseId },
      data: dto,
      include: this.getCourseInclude(),
    });
    return this.serialize(course);
  }

  async remove(instructorId: string, courseId: string) {
    await this.assertOwnership(instructorId, courseId);
    await this.prisma.course.delete({ where: { id: courseId } });
    return { success: true };
  }

  async addModule(instructorId: string, courseId: string, dto: CreateModuleDto) {
    await this.assertOwnership(instructorId, courseId);
    return this.prisma.module.create({ data: { ...dto, courseId } });
  }

  async addLesson(instructorId: string, courseId: string, moduleId: string, dto: CreateLessonDto) {
    await this.assertOwnership(instructorId, courseId);
    const module = await this.prisma.module.findUnique({ where: { id: moduleId } });
    if (!module || module.courseId !== courseId) {
      throw new NotFoundException('Module not found on this course.');
    }
    return this.prisma.lesson.create({ data: { ...dto, moduleId } });
  }

  async toggleLessonCompletion(studentId: string, lessonId: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { module: true },
    });
    if (!lesson) throw new NotFoundException('Lesson not found.');

    const existing = await this.prisma.lessonCompletion.findUnique({
      where: { studentId_lessonId: { studentId, lessonId } },
    });

    if (existing) {
      await this.prisma.lessonCompletion.delete({ where: { id: existing.id } });
    } else {
      await this.prisma.lessonCompletion.create({ data: { studentId, lessonId } });
    }

    const progressPercent = await this.updateCourseProgress(studentId, lesson.module.courseId);
    return { completed: !existing, progressPercent };
  }

  private async updateCourseProgress(studentId: string, courseId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: {
        modules: {
          include: {
            lessons: {
              include: {
                completions: { where: { studentId } },
              },
            },
          },
        },
      },
    });

    if (!course) return 0;

    const allLessons = course.modules.flatMap((m: any) => m.lessons);
    const completedLessons = allLessons.filter((l: any) => l.completions.length > 0);

    const progressPercent =
      allLessons.length === 0 ? 0 : Math.round((completedLessons.length / allLessons.length) * 100);

    await this.prisma.enrollment.update({
      where: { studentId_courseId: { studentId, courseId } },
      data: { progressPercent },
    });

    return progressPercent;
  }

  private async assertOwnership(instructorId: string, courseId: string) {
    const course = await this.prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw new NotFoundException('Course not found.');
    if (course.instructorId !== instructorId) {
      throw new ForbiddenException('You do not own this course.');
    }
    return course;
  }
}
