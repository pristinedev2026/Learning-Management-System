import { gradeQuiz, type GradableQuestion } from '../grading';

const questions: GradableQuestion[] = [
  { id: 'q1', type: 'multiple_choice', correctAnswer: 'Blue', points: 10 },
  { id: 'q2', type: 'true_false', correctAnswer: 'false', points: 5 },
  { id: 'q3', type: 'short_answer', correctAnswer: '', points: 10 },
];

describe('gradeQuiz', () => {
  it('awards full points for correct answers', () => {
    expect(gradeQuiz(questions, { q1: 'Blue', q2: 'false' }).score).toBe(15);
  });

  it('is case-insensitive and trims whitespace', () => {
    expect(gradeQuiz(questions, { q1: '  blue ', q2: 'FALSE' }).score).toBe(15);
  });

  it('awards zero for incorrect or missing answers', () => {
    expect(gradeQuiz(questions, { q1: 'Green' }).score).toBe(0);
    expect(gradeQuiz(questions, {}).score).toBe(0);
  });

  it('excludes short-answer from score but includes it in maxScore', () => {
    const result = gradeQuiz(questions, { q1: 'Blue', q2: 'false', q3: 'anything' });
    expect(result.score).toBe(15);
    expect(result.maxScore).toBe(25);
  });
});
