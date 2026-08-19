import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { QuizTakerScreen } from '../QuizTakerScreen';
import { useSubmitQuizAttempt } from '@/services/queries';
import { useAuthStore } from '@/store/authStore';
import { ThemeProvider } from '@/theme/ThemeContext';

// Mock dependencies
jest.mock('@/services/queries');
jest.mock('@/store/authStore');

const AllProviders = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>{children}</ThemeProvider>
);

const renderWithProviders = (ui: React.ReactElement) =>
  render(ui, { wrapper: AllProviders });

const mockQuiz = {
  id: 'q1',
  title: 'Math Quiz',
  questions: [
    {
      id: 'ques1',
      type: 'multiple_choice',
      text: 'What is 2+2?',
      options: ['3', '4', '5'],
      points: 5,
    },
    {
      id: 'ques2',
      type: 'true_false',
      text: 'Is the earth round?',
      correctAnswer: 'True',
      points: 5,
    },
  ],
};

const mockNavigation = {
  replace: jest.fn(),
  goBack: jest.fn(),
};

const mockRoute = {
  params: {
    quiz: mockQuiz,
    courseId: 'c1',
  },
};

describe('QuizTakerScreen', () => {
  const mockMutateAsync = jest.fn();

  beforeEach(() => {
    (useAuthStore as unknown as jest.Mock).mockReturnValue({ id: 'u1', name: 'Student' });
    (useSubmitQuizAttempt as jest.Mock).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    });
  });

  it('renders correctly', () => {
    const { getByText } = renderWithProviders(
      <QuizTakerScreen route={mockRoute as any} navigation={mockNavigation as any} />
    );

    expect(getByText('Math Quiz')).toBeTruthy();
    expect(getByText('Question 1 of 2')).toBeTruthy();
    expect(getByText('What is 2+2?')).toBeTruthy();
  });

  it('allows answering questions and navigating', async () => {
    const { getByText } = renderWithProviders(
      <QuizTakerScreen route={mockRoute as any} navigation={mockNavigation as any} />
    );

    // Select answer for question 1
    fireEvent.press(getByText('4'));

    // Go to next question
    fireEvent.press(getByText('Next →'));

    await waitFor(() => {
      expect(getByText('Question 2 of 2')).toBeTruthy();
      expect(getByText('Is the earth round?')).toBeTruthy();
    });

    // Select answer for question 2
    fireEvent.press(getByText('True'));

    // Submit button should be visible on last question
    expect(getByText('Submit Quiz')).toBeTruthy();
  });

  it('calls submit mutation on submit', async () => {
    mockMutateAsync.mockResolvedValueOnce({ id: 'attempt1', score: 10 });
    const { getByText } = renderWithProviders(
      <QuizTakerScreen route={mockRoute as any} navigation={mockNavigation as any} />
    );

    fireEvent.press(getByText('4'));
    fireEvent.press(getByText('Next →'));
    fireEvent.press(getByText('True'));

    fireEvent.press(getByText('Submit Quiz'));

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        quizId: 'q1',
        studentId: 'u1',
        answers: { ques1: '4', ques2: 'True' },
      });
      expect(mockNavigation.replace).toHaveBeenCalledWith('QuizResults', expect.anything());
    });
  });
});
