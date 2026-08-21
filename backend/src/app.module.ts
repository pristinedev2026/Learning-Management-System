import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CoursesModule } from './courses/courses.module';
import { EnrollmentsModule } from './enrollments/enrollments.module';
import { AssignmentsModule } from './assignments/assignments.module';
import { QuizzesModule } from './quizzes/quizzes.module';
import { AnnouncementsModule } from './announcements/announcements.module';
import { DiscussionsModule } from './discussions/discussions.module';
import { AdminModule } from './admin/admin.module';
import { StudentModule } from './student/student.module';
import { PaymentsModule } from './payments/payments.module';
import { GamificationModule } from './gamification/gamification.module';
import { MessagesModule } from './messages/messages.module';
import { UploadsModule } from './uploads/uploads.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    PrismaModule,
    AuthModule,
    CoursesModule,
    EnrollmentsModule,
    AssignmentsModule,
    QuizzesModule,
    AnnouncementsModule,
    DiscussionsModule,
    AdminModule,
    StudentModule,
    PaymentsModule,
    GamificationModule,
    MessagesModule,
    UploadsModule,
  ],
})
export class AppModule {}
