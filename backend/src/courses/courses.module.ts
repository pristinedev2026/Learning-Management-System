import { Module } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { GamificationModule } from '../gamification/gamification.module';

@Module({
  imports: [GamificationModule],
  providers: [CoursesService, ReviewsService],
  controllers: [CoursesController, ReviewsController],
  exports: [CoursesService],
})
export class CoursesModule {}
