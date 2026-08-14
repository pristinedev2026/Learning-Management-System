import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateAnnouncementDto } from './dto/announcement.dto';

@Injectable()
export class AnnouncementsService {
  constructor(private prisma: PrismaService) {}

  forCourse(courseId: string) {
    return this.prisma.announcement.findMany({ where: { courseId }, orderBy: { postedAt: 'desc' } });
  }

  async create(instructorId: string, courseId: string, dto: CreateAnnouncementDto) {
    const course = await this.prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw new NotFoundException('Course not found.');
    if (course.instructorId !== instructorId) {
      throw new ForbiddenException('You do not own this course.');
    }
    return this.prisma.announcement.create({ data: { ...dto, courseId } });
  }
}
