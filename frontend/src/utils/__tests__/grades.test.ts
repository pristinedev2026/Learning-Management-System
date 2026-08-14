import { calculateCourseGrade } from '@/utils/grades';
import type { Assignment, Quiz, QuizAttempt, Submission } from '@/types';

const assignments: Assignment[] = [
  {
    id: 'a1',
    courseId: 'c1',
    title: 'Assignment 1',
    description: '',
    dueDate: '2026-08-01T00:00:00Z',
    pointsPossible: 100,
    submissionType: 'text',
  },
  {
    id: 'a2',
    courseId: 'c1',
    title: 'Assignment 2',
    description: '',
    dueDate: '2026-08-10T00:00:00Z',
    pointsPossible: 50,
    submissionType: 'file',
  },
];

const quizzes: Quiz[] = [
  {
    id: 'q1',
    courseId: 'c1',
    title: 'Quiz 1',
    dueDate: '2026-08-05T00:00:00Z',
    questions: [
      { id: 'q1a', quizId: 'q1', type: 'true_false', text: '', correctAnswer: 'true', points: 20 },
      { id: 'q1b', quizId: 'q1', type: 'true_false', text: '', correctAnswer: 'false', points: 30 },
    ],
  },
];

describe('calculateCourseGrade', () => {
  it('returns null when nothing has been graded yet', () => {
    const result = calculateCourseGrade({
      assignments,
      submissions: [],
      quizzes,
      quizAttempts: [],
    });
    expect(result.percent).toBeNull();
    expect(result.breakdown).toHaveLength(0);
  });

  it('excludes ungraded submissions from the calculation', () => {
    const submissions: Submission[] = [
      { id: 's1', assignmentId: 'a1', studentId: 'u1', submittedAt: '2026-08-02T00:00:00Z' }, // no score yet
      {
        id: 's2',
        assignmentId: 'a2',
        studentId: 'u1',
        submittedAt: '2026-08-11T00:00:00Z',
        score: 45,
        gradedAt: '2026-08-12T00:00:00Z',
      },
    ];
    const result = calculateCourseGrade({ assignments, submissions, quizzes, quizAttempts: [] });
    expect(result.breakdown).toHaveLength(1);
    expect(result.percent).toBe(90); // 45/50
  });

  it('combines graded assignments and quiz attempts into one weighted percentage', () => {
    const submissions: Submission[] = [
      {
        id: 's1',
        assignmentId: 'a1',
        studentId: 'u1',
        submittedAt: '2026-08-02T00:00:00Z',
        score: 80,
        gradedAt: '2026-08-03T00:00:00Z',
      },
      {
        id: 's2',
        assignmentId: 'a2',
        studentId: 'u1',
        submittedAt: '2026-08-11T00:00:00Z',
        score: 50,
        gradedAt: '2026-08-12T00:00:00Z',
      },
    ];
    const quizAttempts: QuizAttempt[] = [
      { id: 'qa1', quizId: 'q1', studentId: 'u1', answers: {}, score: 40, submittedAt: '2026-08-06T00:00:00Z' },
    ];
    // earned = 80 + 50 + 40 = 170; possible = 100 + 50 + 50 = 200 -> 85%
    const result = calculateCourseGrade({ assignments, submissions, quizzes, quizAttempts });
    expect(result.percent).toBe(85);
    expect(result.breakdown).toHaveLength(3);
  });

  it('handles a perfect score', () => {
    const submissions: Submission[] = [
      { id: 's1', assignmentId: 'a1', studentId: 'u1', submittedAt: '', score: 100 },
      { id: 's2', assignmentId: 'a2', studentId: 'u1', submittedAt: '', score: 50 },
    ];
    const result = calculateCourseGrade({ assignments, submissions, quizzes: [], quizAttempts: [] });
    expect(result.percent).toBe(100);
  });

  it('rounds to one decimal place', () => {
    const submissions: Submission[] = [
      { id: 's1', assignmentId: 'a1', studentId: 'u1', submittedAt: '', score: 87 },
    ];
    const result = calculateCourseGrade({
      assignments: [assignments[0]!],
      submissions,
      quizzes: [],
      quizAttempts: [],
    });
    expect(result.percent).toBe(87);
  });
});
