import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GamificationService } from '../gamification/gamification.service';
import { UploadsService } from '../uploads/uploads.service';
import type {
  CreateCourseDto,
  CreateLessonDto,
  CreateModuleDto,
  UpdateCourseDto,
  UpdateLessonDto,
} from './dto/course.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class CoursesService {
  constructor(
    private prisma: PrismaService,
    private gamification: GamificationService,
    private uploads: UploadsService
  ) {}

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

  async catalog(search?: string, category?: string) {
    const where: Prisma.CourseWhereInput = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category) {
      where.category = category;
    }

    const courses = await this.prisma.course.findMany({
      where,
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

  async getInstructorStats(instructorId: string) {
    const courses = await this.prisma.course.findMany({
      where: { instructorId },
      select: {
        id: true,
      },
    });

    const totalCourses = courses.length;

    const uniqueStudents = await this.prisma.enrollment.findMany({
      where: {
        course: { instructorId },
      },
      select: { studentId: true },
      distinct: ['studentId'],
    });

    const totalStudents = uniqueStudents.length;
    console.log(`Instructor ${instructorId} unique stats: Courses=${totalCourses}, Students=${totalStudents}`);

    const toGrade = await this.prisma.submission.count({
      where: {
        score: null,
        assignment: {
          course: { instructorId },
        },
      },
    });

    return { totalCourses, totalStudents, toGrade };
  }

  async getInstructorAnalytics(instructorId: string) {
    const courses = await this.prisma.course.findMany({
      where: { instructorId },
      include: {
        _count: { select: { enrollments: true } },
        modules: {
          include: {
            lessons: {
              include: {
                _count: { select: { completions: true } },
              },
            },
          },
        },
      },
    });

    const courseEngagement = courses.map((course) => {
      const totalLessons = course.modules.reduce((sum, m) => sum + m.lessons.length, 0);
      const totalCompletions = course.modules.reduce(
        (sum, m) => sum + m.lessons.reduce((lSum, l) => lSum + l._count.completions, 0),
        0
      );

      return {
        id: course.id,
        title: course.title,
        students: course._count.enrollments,
        completionRate:
          totalLessons === 0 || course._count.enrollments === 0
            ? 0
            : Math.round((totalCompletions / (totalLessons * course._count.enrollments)) * 100),
      };
    });

    // Mocking some time-series data for the demo
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    const activityTrend = last7Days.map((date) => ({
      date,
      completions: Math.floor(Math.random() * 20) + 5,
    }));

    return { courseEngagement, activityTrend };
  }

  async getInstructorStudents(instructorId: string) {
    // Get all courses owned by this instructor
    const courses = await this.prisma.course.findMany({
      where: { instructorId },
      select: { id: true, title: true },
    });

    const courseIds = courses.map((c) => c.id);
    const courseTitles = courses.reduce((acc, c) => ({ ...acc, [c.id]: c.title }), {} as any);

    // Get all enrollments for these courses
    const enrollments = await this.prisma.enrollment.findMany({
      where: {
        courseId: { in: courseIds },
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { enrolledAt: 'desc' },
    });

    const studentMap = new Map();
    enrollments.forEach((e) => {
      const courseTitle = courseTitles[e.courseId] || 'Unknown Course';
      if (!studentMap.has(e.studentId)) {
        studentMap.set(e.studentId, {
          id: e.student.id,
          name: e.student.name,
          email: e.student.email,
          phone: e.student.phone,
          avatarUrl: e.student.avatarUrl,
          enrolledCourses: [courseTitle],
          firstEnrolledAt: e.enrolledAt,
        });
      } else {
        const student = studentMap.get(e.studentId);
        if (!student.enrolledCourses.includes(courseTitle)) {
          student.enrolledCourses.push(courseTitle);
        }
      }
    });

    return Array.from(studentMap.values());
  }

  async create(instructorId: string, dto: CreateCourseDto) {
    const course = await this.prisma.course.create({
      data: { ...dto, instructorId },
      include: this.getCourseInclude(),
    });
    return this.serialize(course);
  }

  async update(instructorId: string, courseId: string, dto: UpdateCourseDto) {
    const existingCourse = await this.assertOwnership(instructorId, courseId);

    // If a new image is being set, delete the old one
    if (dto.coverImageUrl && existingCourse.coverImageUrl && existingCourse.coverImageUrl !== dto.coverImageUrl) {
      this.uploads.deleteFile(existingCourse.coverImageUrl);
    }

    const course = await this.prisma.course.update({
      where: { id: courseId },
      data: dto,
      include: this.getCourseInclude(),
    });
    return this.serialize(course);
  }

  async remove(instructorId: string, courseId: string) {
    const existingCourse = await this.assertOwnership(instructorId, courseId);

    // Delete the image file if it exists
    if (existingCourse.coverImageUrl) {
      this.uploads.deleteFile(existingCourse.coverImageUrl);
    }

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

  async updateLesson(
    instructorId: string,
    courseId: string,
    moduleId: string,
    lessonId: string,
    dto: UpdateLessonDto
  ) {
    await this.assertOwnership(instructorId, courseId);
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { module: true },
    });

    if (!lesson || lesson.moduleId !== moduleId || lesson.module.courseId !== courseId) {
      throw new NotFoundException('Lesson not found in the specified module/course.');
    }

    return this.prisma.lesson.update({
      where: { id: lessonId },
      data: dto,
    });
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

    if (progressPercent === 100) {
      await this.gamification.awardBadge(studentId, 'COURSE_COMPLETE');
    }

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
