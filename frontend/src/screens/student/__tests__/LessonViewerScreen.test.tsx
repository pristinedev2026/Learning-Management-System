import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { LessonViewerScreen } from '../LessonViewerScreen';
import { useToggleLessonCompletion } from '@/services/queries';
import { ThemeProvider } from '@/theme/ThemeContext';

jest.mock('@/services/queries');
jest.mock('@/utils/offlineManager', () => ({
  getLocalUri: jest.fn().mockResolvedValue(null),
  isLessonDownloaded: jest.fn().mockResolvedValue(false),
  downloadLessonFile: jest.fn(),
  deleteLessonFile: jest.fn(),
}));

jest.mock('expo-av', () => {
  const { View } = require('react-native');
  return { Video: View };
});

const AllProviders = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>{children}</ThemeProvider>
);

const renderWithProviders = (ui: React.ReactElement) =>
  render(ui, { wrapper: AllProviders });

const mockLesson = {
  id: 'l1',
  title: 'Introduction',
  type: 'text',
  content: '# Hello\nThis is a test lesson.',
  completed: false,
};

const mockNavigation = {
  replace: jest.fn(),
  goBack: jest.fn(),
};

const mockRoute = {
  params: {
    lesson: mockLesson,
    moduleId: 'm1',
    courseId: 'c1',
    allLessonsInModule: [mockLesson],
  },
};

describe('LessonViewerScreen', () => {
  const mockMutateAsync = jest.fn();

  beforeEach(() => {
    (useToggleLessonCompletion as jest.Mock).mockReturnValue({
      mutateAsync: mockMutateAsync,
    });
  });

  it('renders lesson content', () => {
    const { getByText } = renderWithProviders(
      <LessonViewerScreen route={mockRoute as any} navigation={mockNavigation as any} />
    );

    expect(getByText('Introduction')).toBeTruthy();
    expect(getByText('Hello')).toBeTruthy();
    expect(getByText('This is a test lesson.')).toBeTruthy();
  });

  it('toggles completion status', async () => {
    mockMutateAsync.mockResolvedValueOnce({ completed: true, progressPercent: 100 });
    const { getByText } = renderWithProviders(
      <LessonViewerScreen route={mockRoute as any} navigation={mockNavigation as any} />
    );

    const button = getByText('☐ Mark Complete');
    fireEvent.press(button);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith('l1');
      expect(getByText('✓ Completed')).toBeTruthy();
    });
  });

  it('navigates back when back button pressed', () => {
    const { getByText } = renderWithProviders(
      <LessonViewerScreen route={mockRoute as any} navigation={mockNavigation as any} />
    );

    fireEvent.press(getByText('← Back to course'));
    expect(mockNavigation.goBack).toHaveBeenCalled();
  });
});
