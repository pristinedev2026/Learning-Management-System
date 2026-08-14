import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { AssignmentsService } from './assignments.service';
import { CreateAssignmentDto, GradeSubmissionDto, SubmitAssignmentDto } from './dto/assignment.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/jwt.strategy';

@Controller()
export class AssignmentsController {
  constructor(private assignmentsService: AssignmentsService) {}

  @Get('courses/:courseId/assignments')
  forCourse(@Param('courseId') courseId: string) {
    return this.assignmentsService.forCourse(courseId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.instructor)
  @Post('courses/:courseId/assignments')
  create(
    @CurrentUser() user: JwtPayload,
    @Param('courseId') courseId: string,
    @Body() dto: CreateAssignmentDto
  ) {
    return this.assignmentsService.create(user.sub, courseId, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.student)
  @Post('assignments/:assignmentId/submit')
  submit(
    @CurrentUser() user: JwtPayload,
    @Param('assignmentId') assignmentId: string,
    @Body() dto: SubmitAssignmentDto
  ) {
    return this.assignmentsService.submit(user.sub, assignmentId, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.student)
  @Get('assignments/:assignmentId/my-submission')
  mySubmission(@CurrentUser() user: JwtPayload, @Param('assignmentId') assignmentId: string) {
    return this.assignmentsService.mySubmission(user.sub, assignmentId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.instructor)
  @Get('courses/:courseId/submissions')
  submissionsForCourse(@CurrentUser() user: JwtPayload, @Param('courseId') courseId: string) {
    return this.assignmentsService.submissionsForCourse(user.sub, courseId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.instructor)
  @Post('submissions/:submissionId/grade')
  grade(
    @CurrentUser() user: JwtPayload,
    @Param('submissionId') submissionId: string,
    @Body() dto: GradeSubmissionDto
  ) {
    return this.assignmentsService.grade(user.sub, submissionId, dto);
  }
}
