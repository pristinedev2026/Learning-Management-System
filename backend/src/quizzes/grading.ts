export interface GradableQuestion {
  id: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer';
  correctAnswer: string;
  points: number;
}

/**
 * Auto-grading logic. Kept as a pure function (no DB access) so it stays
 * unit-testable, mirroring src/services/api.ts::gradeQuiz in the mobile app.
 * Short-answer questions are excluded from the auto-graded score and left
 * for manual review, but their points still count toward maxScore.
 */
export function gradeQuiz(
  questions: GradableQuestion[],
  answers: Record<string, string>
): { score: number; maxScore: number } {
  let score = 0;
  let maxScore = 0;

  for (const question of questions) {
    maxScore += question.points;
    if (question.type === 'short_answer') continue;

    const given = answers[question.id]?.trim().toLowerCase();
    const correct = question.correctAnswer.trim().toLowerCase();

    if (given && given === correct) {
      score += question.points;
    }
  }

  return { score, maxScore };
}
