import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import { EnrollDto } from './dto/enroll.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';
import type { JwtPayload } from '../auth/jwt.strategy';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.student)
@Controller('enrollments')
export class EnrollmentsController {
  constructor(private enrollmentsService: EnrollmentsService) {}

  @Get('me')
  myEnrollments(@CurrentUser() user: JwtPayload) {
    return this.enrollmentsService.myEnrollments(user.sub);
  }

  @Post()
  enroll(@CurrentUser() user: JwtPayload, @Body() dto: EnrollDto) {
    return this.enrollmentsService.enroll(user.sub, dto.courseId);
  }
}
