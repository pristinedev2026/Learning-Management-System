import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateDiscussionPostDto } from './dto/discussion.dto';

@Injectable()
export class DiscussionsService {
  constructor(private prisma: PrismaService) {}

  async forCourse(courseId: string) {
    const course = await this.prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw new NotFoundException('Course not found.');

    return this.prisma.discussionPost.findMany({
      where: { courseId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            role: true,
          },
        },
      },
      orderBy: { postedAt: 'desc' },
    });
  }

  async create(userId: string, courseId: string, dto: CreateDiscussionPostDto) {
    const course = await this.prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw new NotFoundException('Course not found.');

    return this.prisma.discussionPost.create({
      data: {
        body: dto.body,
        parentId: dto.parentId,
        courseId,
        authorId: userId,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            role: true,
          },
        },
      },
    });
  }
}
