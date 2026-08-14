import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import type {
  ChangePasswordDto,
  LoginDto,
  SignUpDto,
  UpdateProfileDto,
  UserInitiatedChangePasswordDto,
} from './dto/auth.dto';

interface UserRecord {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  role: string;
  avatarUrl: string | null;
  mustChangePassword: boolean;
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService
  ) {}

  private toPublicUser(user: UserRecord) {
    return {
      id: user.id,
      name: user.name,
      phone: user.phone,
      email: user.email ?? undefined,
      role: user.role,
      avatarUrl: user.avatarUrl ?? undefined,
      mustChangePassword: user.mustChangePassword,
    };
  }

  private sign(user: { id: string; phone: string; name: string; role: string }) {
    return this.jwt.sign({
      sub: user.id,
      phone: user.phone,
      name: user.name,
      role: user.role,
    });
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { phone: dto.phone } });
    if (!user) {
      throw new UnauthorizedException('Invalid phone number or password.');
    }
    const passwordMatches = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid phone number or password.');
    }
    return {
      accessToken: this.sign(user),
      user: this.toPublicUser(user),
    };
  }

  async signUp(dto: SignUpDto) {
    const existing = await this.prisma.user.findUnique({ where: { phone: dto.phone } });
    if (existing) {
      throw new ConflictException('An account with this phone number already exists.');
    }
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: { name: dto.name, phone: dto.phone, email: dto.email, passwordHash, role: dto.role },
    });
    return {
      accessToken: this.sign(user),
      user: this.toPublicUser(user),
    };
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found.');
    }
    return this.toPublicUser(user);
  }

  /**
   * Self-service password change. Used both for a voluntary change and for
   * completing an admin-forced reset (mustChangePassword clears once this
   * succeeds).
   */
  async changePassword(userId: string, dto: ChangePasswordDto) {
    const passwordHash = await bcrypt.hash(dto.newPassword, 10);
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash, mustChangePassword: false },
    });
    return this.toPublicUser(user);
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { name: dto.name, email: dto.email },
    });
    return this.toPublicUser(user);
  }

  async changePasswordVoluntary(userId: string, dto: UserInitiatedChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found.');
    }
    const passwordMatches = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!passwordMatches) {
      throw new UnauthorizedException('Current password is incorrect.');
    }
    const passwordHash = await bcrypt.hash(dto.newPassword, 10);
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash, mustChangePassword: false },
    });
    return this.toPublicUser(updatedUser);
  }
}
