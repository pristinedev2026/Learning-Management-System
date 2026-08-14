import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { QuizzesService } from './quizzes.service';
import { CreateQuizDto, SubmitQuizAttemptDto } from './dto/quiz.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/jwt.strategy';

@Controller()
export class QuizzesController {
  constructor(private quizzesService: QuizzesService) {}

  @Get('courses/:courseId/quizzes')
  forCourse(@Param('courseId') courseId: string) {
    return this.quizzesService.forCourse(courseId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.instructor)
  @Post('courses/:courseId/quizzes')
  create(@CurrentUser() user: JwtPayload, @Param('courseId') courseId: string, @Body() dto: CreateQuizDto) {
    return this.quizzesService.create(user.sub, courseId, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.student)
  @Post('quizzes/:quizId/attempts')
  submitAttempt(
    @CurrentUser() user: JwtPayload,
    @Param('quizId') quizId: string,
    @Body() dto: SubmitQuizAttemptDto
  ) {
    return this.quizzesService.submitAttempt(user.sub, quizId, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.student)
  @Get('quizzes/:quizId/my-attempt')
  myAttempt(@CurrentUser() user: JwtPayload, @Param('quizId') quizId: string) {
    return this.quizzesService.myAttempt(user.sub, quizId);
  }
}
