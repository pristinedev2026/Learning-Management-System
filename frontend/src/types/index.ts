export type Role = 'student' | 'instructor' | 'admin';

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: Role;
  avatarUrl?: string;
  // True right after an administrator resets or force-flags this account.
  // The app should route the user to the change-password screen until
  // they set their own new password.
  mustChangePassword?: boolean;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  instructorId: string;
  instructorName: string;
  coverImageUrl?: string;
  syllabus: string;
  category: string;
  modules: Module[];
  studentCount: number;
}

export interface Module {
  id: string;
  courseId: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

export type LessonType = 'video' | 'text' | 'pdf';

export interface Lesson {
  id: string;
  moduleId: string;
  type: LessonType;
  order: number;
  title: string;
  content: string; // video URL, markdown text, or PDF URL depending on type
  durationMinutes?: number;
  completed?: boolean;
}

export type EnrollmentStatus = 'active' | 'completed' | 'dropped';

export interface Enrollment {
  id: string;
  studentId: string;
  courseId: string;
  enrolledAt: string;
  status: EnrollmentStatus;
  progressPercent: number;
}

export type SubmissionType = 'text' | 'file';

export interface Assignment {
  id: string;
  courseId: string;
  title: string;
  description: string;
  dueDate: string;
  pointsPossible: number;
  submissionType: SubmissionType;
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  content?: string;
  fileUrl?: string;
  submittedAt: string;
  score?: number;
  feedback?: string;
  gradedAt?: string;
}

export type QuestionType = 'multiple_choice' | 'true_false' | 'short_answer';

export interface Question {
  id: string;
  quizId: string;
  type: QuestionType;
  text: string;
  options?: string[];
  correctAnswer: string;
  points: number;
}

export interface Quiz {
  id: string;
  courseId: string;
  title: string;
  questions: Question[];
  dueDate: string;
  timeLimitMinutes?: number;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  studentId: string;
  answers: Record<string, string>; // questionId -> answer
  score: number;
  submittedAt: string;
}

export interface Announcement {
  id: string;
  courseId: string;
  title: string;
  body: string;
  postedAt: string;
}

export interface DiscussionPost {
  id: string;
  courseId: string;
  authorId: string;
  author: {
    id: string;
    name: string;
    avatarUrl?: string;
    role: Role;
  };
  body: string;
  postedAt: string;
  parentId?: string;
}

export interface CalendarItem {
  id: string;
  type: 'assignment' | 'quiz';
  title: string;
  dueDate: string;
  courseTitle: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: 'assignment' | 'grade' | 'deadline' | 'announcement';
  read: boolean;
  createdAt: string;
}
