import type { Assignment, Question, Quiz, QuizAttempt, Submission } from '@/types';

export interface GradedItem {
  id: string;
  title: string;
  earnedPoints: number;
  possiblePoints: number;
}

/**
 * Computes a student's overall percentage grade for a course from their
 * graded assignment submissions and quiz attempts. Ungraded submissions
 * (no score yet) are excluded from both numerator and denominator so a
 * pending assignment doesn't drag the grade down before it's graded.
 */
export function calculateCourseGrade(params: {
  assignments: Assignment[];
  submissions: Submission[];
  quizzes: Quiz[];
  quizAttempts: QuizAttempt[];
}): { percent: number | null; breakdown: GradedItem[] } {
  const breakdown: GradedItem[] = [];

  for (const assignment of params.assignments) {
    const submission = params.submissions.find((s) => s.assignmentId === assignment.id);
    if (submission?.score !== undefined) {
      breakdown.push({
        id: assignment.id,
        title: assignment.title,
        earnedPoints: submission.score,
        possiblePoints: assignment.pointsPossible,
      });
    }
  }

  for (const quiz of params.quizzes) {
    const attempt = params.quizAttempts.find((a) => a.quizId === quiz.id);
    if (attempt) {
      breakdown.push({
        id: quiz.id,
        title: quiz.title,
        earnedPoints: attempt.score,
        possiblePoints: totalPoints(quiz.questions),
      });
    }
  }

  if (breakdown.length === 0) {
    return { percent: null, breakdown };
  }

  const earned = breakdown.reduce((sum, item) => sum + item.earnedPoints, 0);
  const possible = breakdown.reduce((sum, item) => sum + item.possiblePoints, 0);

  if (possible === 0) {
    return { percent: null, breakdown };
  }

  return { percent: round((earned / possible) * 100), breakdown };
}

function totalPoints(questions: Question[]): number {
  return questions.reduce((sum, q) => sum + q.points, 0);
}

function round(value: number): number {
  return Math.round(value * 10) / 10;
}
