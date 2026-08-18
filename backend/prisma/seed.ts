import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10);

  const instructor = await prisma.user.upsert({
    where: { phone: '091122331' },
    update: {},
    create: {
      name: 'Instructor',
      phone: '091122331',
      email: 'instructor@tun.edu',
      passwordHash,
      role: 'instructor',
    },
  });

  const student = await prisma.user.upsert({
    where: { phone: '091122332' },
    update: {},
    create: {
      name: 'Student',
      phone: '091122332',
      email: 'student@tun.edu',
      passwordHash,
      role: 'student',
    },
  });

  const admin = await prisma.user.upsert({
    where: { phone: '091122330' },
    update: {},
    create: {
      name: 'Admin',
      phone: '091122330',
      email: 'admin@tun.edu',
      passwordHash,
      role: 'admin',
    },
  });

  const course = await prisma.course.create({
    data: {
      title: 'React Native for Beginners',
      description:
        'Build your first cross-platform mobile app from scratch with React Native and Expo.',
      syllabus:
        'Week 1: Setup & fundamentals. Week 2: Navigation. Week 3: State management. Week 4: Ship to app stores.',
      category: 'Mobile Development',
      instructorId: instructor.id,
      modules: {
        create: [
          {
            title: 'Getting Started',
            order: 1,
            lessons: {
              create: [
                {
                  type: 'video',
                  order: 1,
                  title: 'Why React Native',
                  content: 'https://example.com/video/intro.mp4',
                  durationMinutes: 8,
                },
                {
                  type: 'text',
                  order: 2,
                  title: 'Setting up Expo',
                  content: '# Setting up Expo\n\nInstall the Expo CLI and create your first project...',
                },
              ],
            },
          },
          {
            title: 'Navigation Basics',
            order: 2,
            lessons: {
              create: [
                {
                  type: 'video',
                  order: 1,
                  title: 'Stack vs Tab Navigators',
                  content: 'https://example.com/video/nav.mp4',
                  durationMinutes: 12,
                },
              ],
            },
          },
        ],
      },
    },
  });

  await prisma.course.create({
    data: {
      title: 'UI Design Fundamentals',
      description: 'Learn the principles of layout, color, and typography for digital products.',
      syllabus: 'Week 1: Layout & grids. Week 2: Color theory. Week 3: Typography systems.',
      category: 'Design',
      instructorId: instructor.id,
    },
  });

  await prisma.course.create({
    data: {
      title: 'Data Structures & Algorithms',
      description: 'A practical, interview-focused tour of the data structures that matter most.',
      syllabus: 'Week 1: Arrays & strings. Week 2: Trees & graphs. Week 3: Dynamic programming.',
      category: 'Computer Science',
      instructorId: instructor.id,
    },
  });

  await prisma.enrollment.upsert({
    where: { studentId_courseId: { studentId: student.id, courseId: course.id } },
    update: {},
    create: {
      studentId: student.id,
      courseId: course.id,
      status: 'active',
      progressPercent: 35,
    },
  });

  const quiz = await prisma.quiz.create({
    data: {
      courseId: course.id,
      title: 'Navigation Basics Quiz',
      dueDate: new Date('2026-08-15T23:59:00Z'),
      timeLimitMinutes: 10,
      questions: {
        create: [
          {
            type: 'multiple_choice',
            text: 'Which navigator shows screens as tabs at the bottom of the screen?',
            options: ['Stack Navigator', 'Bottom Tab Navigator', 'Drawer Navigator'],
            correctAnswer: 'Bottom Tab Navigator',
            points: 10,
          },
          {
            type: 'true_false',
            text: 'A Stack Navigator can only ever hold two screens.',
            options: [],
            correctAnswer: 'false',
            points: 5,
          },
        ],
      },
    },
  });

  await prisma.assignment.create({
    data: {
      courseId: course.id,
      title: 'Build a Login Screen',
      description: 'Submit a screenshot and a short write-up of your login screen implementation.',
      dueDate: new Date('2026-08-20T23:59:00Z'),
      pointsPossible: 100,
      submissionType: 'file',
    },
  });

  await prisma.announcement.create({
    data: {
      courseId: course.id,
      title: 'Welcome to the course!',
      body: 'Excited to have you here. Check the syllabus and start with Module 1 this week.',
    },
  });

  await prisma.badge.createMany({
    data: [
      {
        name: 'Perfect Score',
        description: 'Achieved 100% on a quiz.',
        icon: 'trophy-outline',
        criteria: 'QUIZ_PERFECT',
      },
      {
        name: 'Course Finisher',
        description: 'Completed 100% of a course.',
        icon: 'ribbon-outline',
        criteria: 'COURSE_COMPLETE',
      },
      {
        name: 'Fast Learner',
        description: 'Completed 5 lessons in one day.',
        icon: 'rocket-outline',
        criteria: 'FAST_LEARNER',
      },
    ],
  });

  console.log('Seed complete.');
  console.log(`Demo login: ${student.phone} / password123 (student)`);
  console.log(`Demo login: ${instructor.phone} / password123 (instructor)`);
  console.log(`Demo login: ${admin.phone} / password123 (admin)`);
  console.log(`Quiz seeded with id: ${quiz.id}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
