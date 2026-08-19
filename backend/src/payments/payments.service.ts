import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async createPaymentIntent(studentId: string, courseId: string) {
    const course = await this.prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw new NotFoundException('Course not found');

    if (course.price <= 0) {
      throw new BadRequestException('Course is free. Enroll directly.');
    }

    // Check if already enrolled
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { studentId_courseId: { studentId, courseId } },
    });
    if (enrollment) throw new BadRequestException('Already enrolled in this course.');

    // In a real app, you would call Stripe here:
    // const intent = await this.stripe.paymentIntents.create({ amount: course.price * 100, currency: 'usd' });

    // For demo, we create a record in our DB
    const payment = await this.prisma.payment.create({
      data: {
        amount: course.price,
        studentId,
        courseId,
        stripeId: `pi_mock_${Math.random().toString(36).substr(2, 9)}`,
        status: 'pending',
      },
    });

    return {
      clientSecret: 'mock_secret_for_client_side_confirmation',
      paymentId: payment.id,
      amount: payment.amount,
    };
  }

  async confirmPayment(paymentId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: { course: true },
    });

    if (!payment) throw new NotFoundException('Payment record not found');

    // Update status
    await this.prisma.payment.update({
      where: { id: paymentId },
      data: { status: 'succeeded' },
    });

    // Create enrollment
    await this.prisma.enrollment.create({
      data: {
        studentId: payment.studentId,
        courseId: payment.courseId,
        status: 'active',
      },
    });

    return { success: true, courseId: payment.courseId };
  }
}
