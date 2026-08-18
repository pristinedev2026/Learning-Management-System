import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { CoursesService } from './courses.service';
import { CreateCourseDto, CreateLessonDto, CreateModuleDto, UpdateCourseDto } from './dto/course.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../common/guards/optional-jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/jwt.strategy';

@Controller('courses')
export class CoursesController {
  constructor(private coursesService: CoursesService) {}

  @Get()
  catalog(@Query('search') search?: string, @Query('category') category?: string) {
    return this.coursesService.catalog(search, category);
  }

  @Get('instructor/:instructorId')
  byInstructor(@Param('instructorId') instructorId: string) {
    return this.coursesService.byInstructor(instructorId);
  }

  @Get('instructor/:instructorId/stats')
  stats(@Param('instructorId') instructorId: string) {
    return this.coursesService.getInstructorStats(instructorId);
  }

  @Get('instructor/:instructorId/analytics')
  analytics(@Param('instructorId') instructorId: string) {
    return this.coursesService.getInstructorAnalytics(instructorId);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get(':id')
  findById(@Param('id') id: string, @CurrentUser() user?: JwtPayload) {
    return this.coursesService.findById(id, user?.sub);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.instructor)
  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateCourseDto) {
    return this.coursesService.create(user.sub, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.instructor)
  @Patch(':id')
  update(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body() dto: UpdateCourseDto) {
    return this.coursesService.update(user.sub, id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.instructor)
  @Delete(':id')
  remove(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.coursesService.remove(user.sub, id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.instructor)
  @Post(':id/modules')
  addModule(
    @CurrentUser() user: JwtPayload,
    @Param('id') courseId: string,
    @Body() dto: CreateModuleDto
  ) {
    return this.coursesService.addModule(user.sub, courseId, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.instructor)
  @Post(':id/modules/:moduleId/lessons')
  addLesson(
    @CurrentUser() user: JwtPayload,
    @Param('id') courseId: string,
    @Param('moduleId') moduleId: string,
    @Body() dto: CreateLessonDto
  ) {
    return this.coursesService.addLesson(user.sub, courseId, moduleId, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.student)
  @Post('lessons/:lessonId/toggle-completion')
  toggleLessonCompletion(@CurrentUser() user: JwtPayload, @Param('lessonId') lessonId: string) {
    return this.coursesService.toggleLessonCompletion(user.sub, lessonId);
  }
}
