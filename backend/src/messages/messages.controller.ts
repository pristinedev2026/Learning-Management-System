import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/jwt.strategy';

@UseGuards(JwtAuthGuard)
@Controller('messages')
export class MessagesController {
  constructor(private messagesService: MessagesService) {}

  @Get('conversations')
  getConversations(@CurrentUser() user: JwtPayload) {
    return this.messagesService.getConversations(user.sub);
  }

  @Get(':otherUserId')
  getMessages(@CurrentUser() user: JwtPayload, @Param('otherUserId') otherUserId: string) {
    return this.messagesService.getMessages(user.sub, otherUserId);
  }
}
