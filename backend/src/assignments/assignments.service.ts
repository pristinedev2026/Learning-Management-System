import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateAssignmentDto, GradeSubmissionDto, SubmitAssignmentDto } from './dto/assignment.dto';

@Injectable()
export class AssignmentsService {
  constructor(private prisma: PrismaService) {}

  forCourse(courseId: string) {
    return this.prisma.assignment.findMany({ where: { courseId }, orderBy: { dueDate: 'asc' } });
  }

  async create(instructorId: string, courseId: string, dto: CreateAssignmentDto) {
    await this.assertOwnsCourse(instructorId, courseId);
    return this.prisma.assignment.create({
      data: { ...dto, dueDate: new Date(dto.dueDate), courseId },
    });
  }

  async submit(studentId: string, assignmentId: string, dto: SubmitAssignmentDto) {
    return this.prisma.submission.upsert({
      where: { assignmentId_studentId: { assignmentId, studentId } },
      update: { content: dto.content, fileUrl: dto.fileUrl, submittedAt: new Date() },
      create: { assignmentId, studentId, content: dto.content, fileUrl: dto.fileUrl },
    });
  }

  async mySubmission(studentId: string, assignmentId: string) {
    return this.prisma.submission.findUnique({
      where: { assignmentId_studentId: { assignmentId, studentId } },
    });
  }

  /** Grading queue: all submissions across an instructor's course, pending or graded. */
  async submissionsForCourse(instructorId: string, courseId: string) {
    await this.assertOwnsCourse(instructorId, courseId);
    return this.prisma.submission.findMany({
      where: { assignment: { courseId } },
      include: { student: { select: { id: true, name: true, email: true } }, assignment: true },
      orderBy: { submittedAt: 'desc' },
    });
  }

  async grade(instructorId: string, submissionId: string, dto: GradeSubmissionDto) {
    const submission = await this.prisma.submission.findUnique({
      where: { id: submissionId },
      include: { assignment: { include: { course: true } } },
    });
    if (!submission) throw new NotFoundException('Submission not found.');
    if (submission.assignment.course.instructorId !== instructorId) {
      throw new ForbiddenException('You do not own this course.');
    }
    return this.prisma.submission.update({
      where: { id: submissionId },
      data: { score: dto.score, feedback: dto.feedback, gradedAt: new Date() },
    });
  }

  private async assertOwnsCourse(instructorId: string, courseId: string) {
    const course = await this.prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw new NotFoundException('Course not found.');
    if (course.instructorId !== instructorId) {
      throw new ForbiddenException('You do not own this course.');
    }
  }
}
