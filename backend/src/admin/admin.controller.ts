import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { AdminService } from './admin.service';
import { ResetPasswordDto } from './dto/admin.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.admin)
@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('stats')
  getStats() {
    return this.adminService.getStats();
  }

  @Get('users')
  listUsers() {
    return this.adminService.listUsers();
  }

  @Post('users/:userId/reset-password')
  resetPassword(@Param('userId') userId: string, @Body() dto: ResetPasswordDto) {
    return this.adminService.resetPassword(userId, dto);
  }

  @Post('users/:userId/force-password-change')
  forcePasswordChange(@Param('userId') userId: string) {
    return this.adminService.forcePasswordChange(userId);
  }
}
