import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/jwt.strategy';

@Controller('courses/:courseId/reviews')
export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  @Get()
  forCourse(@Param('courseId') courseId: string) {
    return this.reviewsService.forCourse(courseId);
  }

  @Get('summary')
  summary(@Param('courseId') courseId: string) {
    return this.reviewsService.getAverageRating(courseId);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @CurrentUser() user: JwtPayload,
    @Param('courseId') courseId: string,
    @Body('rating') rating: number,
    @Body('comment') comment?: string
  ) {
    return this.reviewsService.create(user.sub, courseId, rating, comment);
  }
}
