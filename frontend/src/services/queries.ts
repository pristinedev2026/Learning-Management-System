import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as api from '@/services/api';
import type { User } from '@/types';

export const queryKeys = {
  catalog: (search?: string) => ['catalog', search ?? ''] as const,
  course: (id: string) => ['course', id] as const,
  myEnrollments: (studentId: string) => ['enrollments', studentId] as const,
  instructorCourses: (instructorId: string) => ['instructor-courses', instructorId] as const,
  assignments: (courseId: string) => ['assignments', courseId] as const,
  quizzes: (courseId: string) => ['quizzes', courseId] as const,
  announcements: (courseId: string) => ['announcements', courseId] as const,
  discussions: (courseId: string) => ['discussions', courseId] as const,
  submissions: (courseId: string) => ['submissions', courseId] as const,
  grades: () => ['grades'] as const,
  calendar: () => ['calendar'] as const,
  notifications: () => ['notifications'] as const,
};

export function useCourseCatalog(search?: string) {
  return useQuery({
    queryKey: queryKeys.catalog(search),
    queryFn: () => api.fetchCourseCatalog(search),
  });
}

export function useCourse(courseId: string) {
  return useQuery({
    queryKey: queryKeys.course(courseId),
    queryFn: () => api.fetchCourseById(courseId),
    enabled: !!courseId,
  });
}

export function useMyEnrollments(studentId: string) {
  return useQuery({
    queryKey: queryKeys.myEnrollments(studentId),
    queryFn: () => api.fetchMyEnrollments(studentId),
    enabled: !!studentId,
  });
}

export function useEnrollInCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { studentId: string; courseId: string }) =>
      api.enrollInCourse(params.studentId, params.courseId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.myEnrollments(variables.studentId) });
    },
  });
}

export function useInstructorCourses(instructorId: string) {
  return useQuery({
    queryKey: queryKeys.instructorCourses(instructorId),
    queryFn: () => api.fetchInstructorCourses(instructorId),
    enabled: !!instructorId,
  });
}

export function useCreateCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createCourse,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.instructorCourses('_') });
    },
  });
}

export function useUpdateCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.updateCourse,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.course(data.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.instructorCourses('_') });
    },
  });
}

export function useDeleteCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.deleteCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.instructorCourses('_') });
    },
  });
}

export function useCreateModule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createModule,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.course(variables.courseId) });
    },
  });
}

export function useCreateLesson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createLesson,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.course(variables.courseId) });
    },
  });
}

export function useAssignments(courseId: string) {
  return useQuery({
    queryKey: queryKeys.assignments(courseId),
    queryFn: () => api.fetchAssignmentsForCourse(courseId),
    enabled: !!courseId,
  });
}

export function useCreateAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createAssignment,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.assignments(variables.courseId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.course(variables.courseId) });
    },
  });
}

export function useUpdateAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.updateAssignment,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.assignments(variables.courseId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.course(variables.courseId) });
    },
  });
}

export function useSubmitAssignment() {
  return useMutation({ mutationFn: api.submitAssignment });
}

export function useQuizzes(courseId: string) {
  return useQuery({
    queryKey: queryKeys.quizzes(courseId),
    queryFn: () => api.fetchQuizzesForCourse(courseId),
    enabled: !!courseId,
  });
}

export function useToggleLessonCompletion(courseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (lessonId: string) => api.toggleLessonCompletion(lessonId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.course(courseId) });
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
    },
  });
}

export function useCreateQuiz() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createQuiz,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.quizzes(variables.courseId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.course(variables.courseId) });
    },
  });
}

export function useUpdateQuiz() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.updateQuiz,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.quizzes(variables.courseId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.course(variables.courseId) });
    },
  });
}

export function useSubmitQuizAttempt() {
  return useMutation({ mutationFn: api.submitQuizAttempt });
}

export function useAnnouncements(courseId: string) {
  return useQuery({
    queryKey: queryKeys.announcements(courseId),
    queryFn: () => api.fetchAnnouncementsForCourse(courseId),
    enabled: !!courseId,
  });
}

export function useCreateAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.postAnnouncement,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.announcements(variables.courseId) });
    },
  });
}

export function useDiscussionPosts(courseId: string) {
  return useQuery({
    queryKey: queryKeys.discussions(courseId),
    queryFn: () => api.fetchDiscussionPosts(courseId),
    enabled: !!courseId,
  });
}

export function useCreateDiscussionPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createDiscussionPost,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.discussions(variables.courseId) });
    },
  });
}

export function useSubmissions(courseId: string) {
  return useQuery({
    queryKey: queryKeys.submissions(courseId),
    queryFn: () => api.fetchSubmissionsForCourse(courseId),
    enabled: !!courseId,
  });
}

export function useGradeSubmission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.gradeSubmission,
    onSuccess: (data) => {
      // We don't have the courseId directly in the gradeSubmission response usually,
      // but we can invalidate all submissions or the specific one if we had its key.
      // For simplicity, invalidating all submissions.
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
    },
  });
}

export function useLogin() {
  return useMutation({
    mutationFn: (params: { phone: string; password: string }) =>
      api.login(params.phone, params.password),
  });
}

export function useSignUp() {
  return useMutation({
    mutationFn: (params: { name: string; phone: string; password: string; role: User['role'] }) =>
      api.signUp(params.name, params.phone, params.password, params.role),
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (params: { newPassword: string }) => api.changePassword(params.newPassword),
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth-me'] });
    },
  });
}

export function useChangePasswordVoluntary() {
  return useMutation({
    mutationFn: api.changePasswordVoluntary,
  });
}

// ---- Admin ----

export function useAllUsers() {
  return useQuery({
    queryKey: ['admin-users'],
    queryFn: () => api.fetchAllUsers(),
  });
}

export function useAdminResetPassword() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { userId: string; newPassword: string }) =>
      api.adminResetPassword(params.userId, params.newPassword),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });
}

export function useAdminForcePasswordChange() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { userId: string }) => api.adminForcePasswordChange(params.userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });
}

export function useMyGrades() {
  return useQuery({
    queryKey: queryKeys.grades(),
    queryFn: api.fetchMyGrades,
  });
}

export function useMyCalendar() {
  return useQuery({
    queryKey: queryKeys.calendar(),
    queryFn: api.fetchMyCalendar,
  });
}

export function useMyNotifications() {
  return useQuery({
    queryKey: queryKeys.notifications(),
    queryFn: api.fetchMyNotifications,
  });
}
