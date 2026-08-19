import { Controller, Get, UseGuards } from '@nestjs/common';
import { GamificationService } from './gamification.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/jwt.strategy';

@UseGuards(JwtAuthGuard)
@Controller('gamification')
export class GamificationController {
  constructor(private gamificationService: GamificationService) {}

  @Get('achievements')
  getAchievements(@CurrentUser() user: JwtPayload) {
    return this.gamificationService.getUserAchievements(user.sub);
  }

  @Get('leaderboard')
  getLeaderboard() {
    return this.gamificationService.getLeaderboard();
  }
}
