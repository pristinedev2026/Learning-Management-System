import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { gradeQuiz } from './grading';
import { GamificationService } from '../gamification/gamification.service';
import type { CreateQuizDto, SubmitQuizAttemptDto } from './dto/quiz.dto';

@Injectable()
export class QuizzesService {
  constructor(
    private prisma: PrismaService,
    private gamification: GamificationService
  ) {}

  async forCourse(courseId: string) {
    return this.prisma.quiz.findMany({
      where: { courseId },
      include: { questions: true },
      orderBy: { dueDate: 'asc' },
    });
  }

  async create(instructorId: string, courseId: string, dto: CreateQuizDto) {
    const course = await this.prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw new NotFoundException('Course not found.');
    if (course.instructorId !== instructorId) {
      throw new ForbiddenException('You do not own this course.');
    }
    return this.prisma.quiz.create({
      data: {
        courseId,
        title: dto.title,
        dueDate: new Date(dto.dueDate),
        timeLimitMinutes: dto.timeLimitMinutes,
        questions: {
          create: dto.questions.map((q) => ({
            type: q.type,
            text: q.text,
            options: q.options ?? [],
            correctAnswer: q.correctAnswer,
            points: q.points,
          })),
        },
      },
      include: { questions: true },
    });
  }

  async submitAttempt(studentId: string, quizId: string, dto: SubmitQuizAttemptDto) {
    const quiz = await this.prisma.quiz.findUnique({ where: { id: quizId }, include: { questions: true } });
    if (!quiz) throw new NotFoundException('Quiz not found.');

    const { score } = gradeQuiz(quiz.questions, dto.answers);
    const totalPoints = quiz.questions.reduce((sum, q) => sum + q.points, 0);

    const attempt = await this.prisma.quizAttempt.upsert({
      where: { quizId_studentId: { quizId, studentId } },
      update: { answers: dto.answers, score, submittedAt: new Date() },
      create: { quizId, studentId, answers: dto.answers, score },
    });

    if (score === totalPoints && totalPoints > 0) {
      await this.gamification.awardBadge(studentId, 'QUIZ_PERFECT');
    }

    return attempt;
  }

  async myAttempt(studentId: string, quizId: string) {
    return this.prisma.quizAttempt.findUnique({
      where: { quizId_studentId: { quizId, studentId } },
    });
  }
}
