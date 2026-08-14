import type {
  Announcement,
  Assignment,
  Course,
  Enrollment,
  Quiz,
  User,
} from '@/types';

export const mockUsers: User[] = [
  { id: 'u1', name: 'Student', phone: '091122332', role: 'student' },
  { id: 'u2', name: 'Instructor', phone: '091122331', role: 'instructor' },
  { id: 'u3', name: 'Admin', phone: '091122330', role: 'admin' },
];

export const mockCourses: Course[] = [
  {
    id: 'c1',
    title: 'React Native for Beginners',
    description:
      'Build your first cross-platform mobile app from scratch with React Native and Expo.',
    instructorId: 'u2',
    instructorName: 'Priya Sharma',
    category: 'Mobile Development',
    syllabus:
      'Week 1: Setup & fundamentals. Week 2: Navigation. Week 3: State management. Week 4: Ship to app stores.',
    studentCount: 1284,
    modules: [
      {
        id: 'm1',
        courseId: 'c1',
        title: 'Getting Started',
        order: 1,
        lessons: [
          {
            id: 'l1',
            moduleId: 'm1',
            type: 'video',
            order: 1,
            title: 'Why React Native',
            content: 'https://example.com/video/intro.mp4',
            durationMinutes: 8,
          },
          {
            id: 'l2',
            moduleId: 'm1',
            type: 'text',
            order: 2,
            title: 'Setting up Expo',
            content: '# Setting up Expo\n\nInstall the Expo CLI and create your first project...',
          },
        ],
      },
      {
        id: 'm2',
        courseId: 'c1',
        title: 'Navigation Basics',
        order: 2,
        lessons: [
          {
            id: 'l3',
            moduleId: 'm2',
            type: 'video',
            order: 1,
            title: 'Stack vs Tab Navigators',
            content: 'https://example.com/video/nav.mp4',
            durationMinutes: 12,
          },
        ],
      },
    ],
  },
  {
    id: 'c2',
    title: 'UI Design Fundamentals',
    description: 'Learn the principles of layout, color, and typography for digital products.',
    instructorId: 'u2',
    instructorName: 'Priya Sharma',
    category: 'Design',
    syllabus: 'Week 1: Layout & grids. Week 2: Color theory. Week 3: Typography systems.',
    studentCount: 942,
    modules: [],
  },
  {
    id: 'c3',
    title: 'Data Structures & Algorithms',
    description: 'A practical, interview-focused tour of the data structures that matter most.',
    instructorId: 'u2',
    instructorName: 'Priya Sharma',
    category: 'Computer Science',
    syllabus: 'Week 1: Arrays & strings. Week 2: Trees & graphs. Week 3: Dynamic programming.',
    studentCount: 3110,
    modules: [],
  },
];

export const mockEnrollments: Enrollment[] = [
  {
    id: 'e1',
    studentId: 'u1',
    courseId: 'c1',
    enrolledAt: '2026-06-01T09:00:00Z',
    status: 'active',
    progressPercent: 35,
  },
];

export const mockAssignments: Assignment[] = [
  {
    id: 'a1',
    courseId: 'c1',
    title: 'Build a Login Screen',
    description: 'Submit a screenshot and a short write-up of your login screen implementation.',
    dueDate: '2026-08-20T23:59:00Z',
    pointsPossible: 100,
    submissionType: 'file',
  },
];

export const mockQuizzes: Quiz[] = [
  {
    id: 'q1',
    courseId: 'c1',
    title: 'Navigation Basics Quiz',
    dueDate: '2026-08-15T23:59:00Z',
    timeLimitMinutes: 10,
    questions: [
      {
        id: 'ques1',
        quizId: 'q1',
        type: 'multiple_choice',
        text: 'Which navigator shows screens as tabs at the bottom of the screen?',
        options: ['Stack Navigator', 'Bottom Tab Navigator', 'Drawer Navigator'],
        correctAnswer: 'Bottom Tab Navigator',
        points: 10,
      },
      {
        id: 'ques2',
        quizId: 'q1',
        type: 'true_false',
        text: 'A Stack Navigator can only ever hold two screens.',
        correctAnswer: 'false',
        points: 5,
      },
    ],
  },
];

export const mockAnnouncements: Announcement[] = [
  {
    id: 'an1',
    courseId: 'c1',
    title: 'Welcome to the course!',
    body: 'Excited to have you here. Check the syllabus and start with Module 1 this week.',
    postedAt: '2026-07-28T10:00:00Z',
  },
];
