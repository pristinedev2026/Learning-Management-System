import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { StudentService } from './student.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/jwt.strategy';

@Controller('student')
@UseGuards(JwtAuthGuard)
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Get('grades')
  getGrades(@CurrentUser() user: JwtPayload) {
    return this.studentService.getGrades(user.sub);
  }

  @Get('calendar')
  getCalendar(@CurrentUser() user: JwtPayload) {
    return this.studentService.getCalendar(user.sub);
  }

  @Get('notifications')
  getNotifications(@CurrentUser() user: JwtPayload) {
    return this.studentService.getNotifications(user.sub);
  }
}
