import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { AdminService } from './admin.service';
import { ResetPasswordDto } from './dto/admin.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.admin)
@Controller('admin/users')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get()
  listUsers() {
    return this.adminService.listUsers();
  }

  @Post(':userId/reset-password')
  resetPassword(@Param('userId') userId: string, @Body() dto: ResetPasswordDto) {
    return this.adminService.resetPassword(userId, dto);
  }

  @Post(':userId/force-password-change')
  forcePasswordChange(@Param('userId') userId: string) {
    return this.adminService.forcePasswordChange(userId);
  }
}
