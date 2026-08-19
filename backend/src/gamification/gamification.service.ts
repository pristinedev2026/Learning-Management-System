import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GamificationService {
  constructor(private prisma: PrismaService) {}

  async getUserAchievements(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        badges: {
          include: { badge: true },
        },
      },
    });

    return {
      streak: user?.streakCount ?? 0,
      badges: user?.badges.map((ub) => ({
        ...ub.badge,
        awardedAt: ub.awardedAt,
      })) ?? [],
    };
  }

  async getLeaderboard() {
    return this.prisma.user.findMany({
      where: { role: 'student' },
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        streakCount: true,
        _count: {
          select: { badges: true },
        },
      },
      orderBy: [
        { streakCount: 'desc' },
      ],
      take: 10,
    });
  }

  async awardBadge(userId: string, criteria: string) {
    const badge = await this.prisma.badge.findFirst({ where: { criteria } });
    if (!badge) return;

    const existing = await this.prisma.userBadge.findUnique({
      where: { userId_badgeId: { userId, badgeId: badge.id } },
    });

    if (!existing) {
      await this.prisma.userBadge.create({
        data: { userId, badgeId: badge.id },
      });

      // Create notification
      await this.prisma.appNotification.create({
        data: {
          userId,
          title: 'New Achievement Unlocked!',
          body: `You've earned the "${badge.name}" badge.`,
          type: 'announcement', // Reusing announcement type or we could add 'achievement'
        },
      });
    }
  }

  async updateStreak(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) return;

    const now = new Date();
    const lastLogin = user.lastLoginAt;

    if (!lastLogin) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { streakCount: 1, lastLoginAt: now },
      });
      return;
    }

    const diffDays = Math.floor((now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      // Logged in next day
      await this.prisma.user.update({
        where: { id: userId },
        data: { streakCount: user.streakCount + 1, lastLoginAt: now },
      });
    } else if (diffDays > 1) {
      // Streak broken
      await this.prisma.user.update({
        where: { id: userId },
        data: { streakCount: 1, lastLoginAt: now },
      });
    } else {
      // Logged in same day, just update lastLoginAt if needed or do nothing
      await this.prisma.user.update({
        where: { id: userId },
        data: { lastLoginAt: now },
      });
    }
  }
}
