import { Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import type { ResetPasswordDto } from './dto/admin.dto';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  private toPublicUser(user: {
    id: string;
    name: string;
    phone: string;
    email: string | null;
    role: string;
    avatarUrl: string | null;
    mustChangePassword: boolean;
    createdAt: Date;
  }) {
    return {
      id: user.id,
      name: user.name,
      phone: user.phone,
      email: user.email ?? undefined,
      role: user.role,
      avatarUrl: user.avatarUrl ?? undefined,
      mustChangePassword: user.mustChangePassword,
      createdAt: user.createdAt,
    };
  }

  async listUsers() {
    const users = await this.prisma.user.findMany({ orderBy: { name: 'asc' } });
    return users.map((u) => this.toPublicUser(u));
  }

  async getStats() {
    const [userCount, courseCount, enrollmentCount, submissionCount] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.course.count(),
      this.prisma.enrollment.count(),
      this.prisma.submission.count(),
    ]);

    // Get some recent activity or breakdown
    const roleBreakdown = await this.prisma.user.groupBy({
      by: ['role'],
      _count: true,
    });

    return {
      totalUsers: userCount,
      totalCourses: courseCount,
      totalEnrollments: enrollmentCount,
      totalSubmissions: submissionCount,
      roles: roleBreakdown.reduce((acc, curr) => ({ ...acc, [curr.role]: curr._count }), {}),
    };
  }

  private async requireUser(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found.');
    return user;
  }

  /**
   * Admin sets a brand-new password for any user — no knowledge of the old
   * password is needed or checked. The user is required to pick their own
   * password the next time they log in (mustChangePassword).
   */
  async resetPassword(userId: string, dto: ResetPasswordDto) {
    await this.requireUser(userId);
    const passwordHash = await bcrypt.hash(dto.newPassword, 10);
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash, mustChangePassword: true },
    });
    return this.toPublicUser(user);
  }

  /**
   * Flags an account so the user must change their password on next login,
   * without the admin having to choose a temporary password themselves.
   */
  async forcePasswordChange(userId: string) {
    await this.requireUser(userId);
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { mustChangePassword: true },
    });
    return this.toPublicUser(user);
  }
}
