import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { DiscussionsService } from './discussions.service';
import { CreateDiscussionPostDto } from './dto/discussion.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/jwt.strategy';

@Controller('courses/:courseId/discussions')
@UseGuards(JwtAuthGuard)
export class DiscussionsController {
  constructor(private discussionsService: DiscussionsService) {}

  @Get()
  forCourse(@Param('courseId') courseId: string) {
    return this.discussionsService.forCourse(courseId);
  }

  @Post()
  create(
    @CurrentUser() user: JwtPayload,
    @Param('courseId') courseId: string,
    @Body() dto: CreateDiscussionPostDto
  ) {
    return this.discussionsService.create(user.sub, courseId, dto);
  }
}
