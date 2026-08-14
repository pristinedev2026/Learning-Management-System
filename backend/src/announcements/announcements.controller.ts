import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { AnnouncementsService } from './announcements.service';
import { CreateAnnouncementDto } from './dto/announcement.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/jwt.strategy';

@Controller('courses/:courseId/announcements')
export class AnnouncementsController {
  constructor(private announcementsService: AnnouncementsService) {}

  @Get()
  forCourse(@Param('courseId') courseId: string) {
    return this.announcementsService.forCourse(courseId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.instructor)
  @Post()
  create(
    @CurrentUser() user: JwtPayload,
    @Param('courseId') courseId: string,
    @Body() dto: CreateAnnouncementDto
  ) {
    return this.announcementsService.create(user.sub, courseId, dto);
  }
}
