import { Body, Controller, Post, UseGuards, Param } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/jwt.strategy';

@UseGuards(JwtAuthGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post('create-intent')
  createIntent(@CurrentUser() user: JwtPayload, @Body('courseId') courseId: string) {
    return this.paymentsService.createPaymentIntent(user.sub, courseId);
  }

  @Post(':paymentId/confirm')
  confirm(@Param('paymentId') paymentId: string) {
    return this.paymentsService.confirmPayment(paymentId);
  }
}
