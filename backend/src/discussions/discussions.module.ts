import { Module } from '@nestjs/common';
import { DiscussionsService } from './discussions.service';
import { DiscussionsController } from './discussions.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [DiscussionsService],
  controllers: [DiscussionsController],
  exports: [DiscussionsService],
})
export class DiscussionsModule {}
