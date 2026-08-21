/**
 * Shared API client. Components never call fetch directly — they go through
 * React Query hooks (src/services/queries.ts) that call functions exported
 * here.
 *
 * This now talks to the real NestJS backend over HTTP. It replaced an
 * earlier in-memory mock version — every function here keeps the same name
 * and mostly the same signature the mock had, so queries.ts and every
 * screen built against it needed no changes beyond auth (which now also
 * returns a token, handled in the auth screens).
 */
import { API_BASE_URL } from './config';
import { getAccessToken } from '@/store/authStore';
import type {
  Announcement,
  Assignment,
  CalendarItem,
  Course,
  Enrollment,
  Quiz,
  QuizAttempt,
  Submission,
  User,
  AppNotification,
  DiscussionPost,
} from '@/types';

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(
  path: string,
  options: { method?: string; body?: unknown; auth?: boolean } = {}
): Promise<T> {
  const { method = 'GET', body, auth = false } = options;

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = getAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(
      "Couldn't reach the server. Check that the backend is running and EXPO_PUBLIC_API_URL is set correctly.",
      0
    );
  }

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const payload = isJson ? await response.json().catch(() => null) : null;

  if (!response.ok) {
    const message =
      (payload && (payload.message instanceof Array ? payload.message.join(', ') : payload.message)) ||
      `Request failed (${response.status})`;
    throw new ApiError(message, response.status);
  }

  return payload as T;
}

// ---- Auth ----

export async function login(phone: string, password: string): Promise<{ user: User; accessToken: string }> {
  return request('/auth/login', { method: 'POST', body: { phone, password } });
}

export async function forgotPassword(phone: string): Promise<{ message: string }> {
  return request('/auth/forgot-password', { method: 'POST', body: { phone } });
}

export async function resetPassword(params: {
  phone: string;
  code: string;
  newPassword: string;
}): Promise<{ success: boolean; message: string }> {
  return request('/auth/reset-password', { method: 'POST', body: params });
}

export async function signUp(
  name: string,
  phone: string,
  password: string,
  role: User['role']
): Promise<{ user: User; accessToken: string }> {
  return request('/auth/signup', { method: 'POST', body: { name, phone, password, role } });
}

export async function fetchMe(): Promise<User> {
  return request('/auth/me', { auth: true });
}

export async function updateProfile(params: { name: string; email?: string }): Promise<User> {
  return request('/auth/profile', { method: 'PATCH', body: params, auth: true });
}

// Self-service password change for forced reset flow.
export async function changePassword(newPassword: string): Promise<User> {
  return request('/auth/change-password', { method: 'PATCH', body: { newPassword }, auth: true });
}

// Self-service password change requiring current password.
export async function changePasswordVoluntary(params: {
  currentPassword: string;
  newPassword: string;
}): Promise<User> {
  return request('/auth/change-password-voluntary', {
    method: 'PATCH',
    body: params,
    auth: true,
  });
}

// ---- Admin ----

export async function fetchAdminStats(): Promise<{
  totalUsers: number;
  totalCourses: number;
  totalEnrollments: number;
  totalSubmissions: number;
  roles: Record<string, number>;
}> {
  return request('/admin/stats', { auth: true });
}

export async function fetchAllUsers(): Promise<User[]> {
  return request('/admin/users', { auth: true });
}

export async function adminResetPassword(userId: string, newPassword: string): Promise<User> {
  return request(`/admin/users/${userId}/reset-password`, {
    method: 'POST',
    body: { newPassword },
    auth: true,
  });
}

export async function adminForcePasswordChange(userId: string): Promise<User> {
  return request(`/admin/users/${userId}/force-password-change`, { method: 'POST', auth: true });
}

// ---- Courses ----

export async function fetchCourseCatalog(query?: string, category?: string): Promise<Course[]> {
  const params = new URLSearchParams();
  if (query) params.append('search', query);
  if (category) params.append('category', category);
  const queryString = params.toString() ? `?${params.toString()}` : '';
  return request(`/courses${queryString}`);
}

export async function fetchCourseById(courseId: string): Promise<Course> {
  return request(`/courses/${courseId}`);
}

export async function fetchInstructorCourses(instructorId: string): Promise<Course[]> {
  return request(`/courses/instructor/${instructorId}`);
}

export async function fetchInstructorStats(
  instructorId: string
): Promise<{ totalCourses: number; totalStudents: number; toGrade: number }> {
  return request(`/courses/instructor/${instructorId}/stats`);
}

export async function fetchInstructorAnalytics(
  instructorId: string
): Promise<{
  courseEngagement: Array<{ id: string; title: string; students: number; completionRate: number }>;
  activityTrend: Array<{ date: string; completions: number }>;
}> {
  return request(`/courses/instructor/${instructorId}/analytics`, { auth: true });
}

export async function fetchInstructorStudents(instructorId: string): Promise<any[]> {
  return request(`/courses/instructor/${instructorId}/students`, { auth: true });
}

export async function createCourse(params: {
  title: string;
  description: string;
  syllabus: string;
  category: string;
  coverImageUrl?: string;
}): Promise<Course> {
  return request('/courses', { method: 'POST', body: params, auth: true });
}

export async function updateCourse(params: {
  courseId: string;
  title?: string;
  description?: string;
  syllabus?: string;
  category?: string;
  coverImageUrl?: string;
}): Promise<Course> {
  const { courseId, ...data } = params;
  return request(`/courses/${courseId}`, { method: 'PATCH', body: data, auth: true });
}

export async function deleteCourse(courseId: string): Promise<void> {
  return request(`/courses/${courseId}`, { method: 'DELETE', auth: true });
}

export async function createModule(params: {
  courseId: string;
  title: string;
  order: number;
}): Promise<any> {
  const { courseId, ...data } = params;
  return request(`/courses/${courseId}/modules`, { method: 'POST', body: data, auth: true });
}

export async function createLesson(params: {
  courseId: string;
  moduleId: string;
  title: string;
  type: 'video' | 'text' | 'pdf';
  order: number;
  content: string;
  durationMinutes?: number;
}): Promise<any> {
  const { courseId, moduleId, ...data } = params;
  return request(`/courses/${courseId}/modules/${moduleId}/lessons`, {
    method: 'POST',
    body: data,
    auth: true,
  });
}

export async function updateLesson(params: {
  lessonId: string;
  courseId: string;
  moduleId: string;
  title?: string;
  type?: 'video' | 'text' | 'pdf';
  order?: number;
  content?: string;
  durationMinutes?: number;
}): Promise<any> {
  const { lessonId, courseId, moduleId, ...data } = params;
  return request(`/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`, {
    method: 'PATCH',
    body: data,
    auth: true,
  });
}

// ---- Enrollments ----

export async function fetchMyEnrollments(_studentId: string): Promise<Enrollment[]> {
  // studentId param kept for call-site compatibility; the backend infers
  // the student from the auth token instead.
  return request('/enrollments/me', { auth: true });
}

export async function enrollInCourse(_studentId: string, courseId: string): Promise<Enrollment> {
  return request('/enrollments', { method: 'POST', body: { courseId }, auth: true });
}

export async function fetchCertificateData(enrollmentId: string): Promise<{
  certificateId: string;
  studentName: string;
  courseTitle: string;
  instructorName: string;
  completionDate: string;
}> {
  return request(`/enrollments/${enrollmentId}/certificate`, { auth: true });
}

// ---- Assignments & Submissions ----

export async function fetchAssignmentsForCourse(courseId: string): Promise<Assignment[]> {
  return request(`/courses/${courseId}/assignments`);
}

export async function createAssignment(params: {
  courseId: string;
  title: string;
  description: string;
  dueDate: string;
  pointsPossible: number;
  submissionType: 'text' | 'file';
}): Promise<Assignment> {
  const { courseId, ...data } = params;
  return request(`/courses/${courseId}/assignments`, {
    method: 'POST',
    body: data,
    auth: true,
  });
}

export async function updateAssignment(params: {
  assignmentId: string;
  courseId: string;
  title?: string;
  description?: string;
  dueDate?: string;
  pointsPossible?: number;
  submissionType?: 'text' | 'file';
}): Promise<Assignment> {
  const { assignmentId, courseId, ...data } = params;
  return request(`/courses/${courseId}/assignments/${assignmentId}`, {
    method: 'PATCH',
    body: data,
    auth: true,
  });
}

export async function submitAssignment(params: {
  assignmentId: string;
  studentId: string;
  content?: string;
  fileUrl?: string;
}): Promise<Submission> {
  return request(`/assignments/${params.assignmentId}/submit`, {
    method: 'POST',
    body: { content: params.content, fileUrl: params.fileUrl },
    auth: true,
  });
}

export async function gradeSubmission(params: {
  submissionId: string;
  score: number;
  feedback?: string;
}): Promise<Submission> {
  return request(`/submissions/${params.submissionId}/grade`, {
    method: 'POST',
    body: { score: params.score, feedback: params.feedback },
    auth: true,
  });
}

export async function fetchSubmissionsForCourse(courseId: string): Promise<any[]> {
  return request(`/courses/${courseId}/submissions`, { auth: true });
}

// ---- Quizzes ----

export async function fetchQuizzesForCourse(courseId: string): Promise<Quiz[]> {
  return request(`/courses/${courseId}/quizzes`);
}

// ---- Lessons ----

export async function toggleLessonCompletion(
  lessonId: string
): Promise<{ completed: boolean; progressPercent: number }> {
  return request(`/courses/lessons/${lessonId}/toggle-completion`, {
    method: 'POST',
    auth: true,
  });
}

export async function createQuiz(params: {
  courseId: string;
  title: string;
  dueDate: string;
  timeLimitMinutes?: number;
  questions: Array<{
    type: 'multiple_choice' | 'true_false' | 'short_answer';
    text: string;
    options?: string[];
    correctAnswer: string;
    points: number;
  }>;
}): Promise<Quiz> {
  const { courseId, ...data } = params;
  return request(`/courses/${courseId}/quizzes`, {
    method: 'POST',
    body: data,
    auth: true,
  });
}

export async function updateQuiz(params: {
  quizId: string;
  courseId: string;
  title?: string;
  dueDate?: string;
  timeLimitMinutes?: number;
  questions?: Array<{
    type: 'multiple_choice' | 'true_false' | 'short_answer';
    text: string;
    options?: string[];
    correctAnswer: string;
    points: number;
  }>;
}): Promise<Quiz> {
  const { quizId, courseId, ...data } = params;
  return request(`/courses/${courseId}/quizzes/${quizId}`, {
    method: 'PATCH',
    body: data,
    auth: true,
  });
}

export async function submitQuizAttempt(params: {
  quizId: string;
  studentId: string;
  answers: Record<string, string>;
}): Promise<QuizAttempt> {
  return request(`/quizzes/${params.quizId}/attempts`, {
    method: 'POST',
    body: { answers: params.answers },
    auth: true,
  });
}

// Auto-grading now happens on the backend (src/quizzes/grading.ts in the
// NestJS project — same logic, unit-tested there instead of here).

// ---- Announcements ----

export async function fetchAnnouncementsForCourse(courseId: string): Promise<Announcement[]> {
  return request(`/courses/${courseId}/announcements`);
}

export async function postAnnouncement(params: {
  courseId: string;
  title: string;
  body: string;
}): Promise<Announcement> {
  return request(`/courses/${params.courseId}/announcements`, {
    method: 'POST',
    body: { title: params.title, body: params.body },
    auth: true,
  });
}

// ---- Discussions ----

export async function fetchDiscussionPosts(courseId: string): Promise<DiscussionPost[]> {
  return request(`/courses/${courseId}/discussions`, { auth: true });
}

export async function createDiscussionPost(params: {
  courseId: string;
  body: string;
  parentId?: string;
}): Promise<DiscussionPost> {
  return request(`/courses/${params.courseId}/discussions`, {
    method: 'POST',
    body: { body: params.body, parentId: params.parentId },
    auth: true,
  });
}

// ---- Reviews ----

export async function fetchReviews(courseId: string): Promise<any[]> {
  return request(`/courses/${courseId}/reviews`);
}

export async function fetchReviewSummary(courseId: string): Promise<{ averageRating: number; reviewCount: number }> {
  return request(`/courses/${courseId}/reviews/summary`);
}

export async function createReview(params: {
  courseId: string;
  rating: number;
  comment?: string;
}): Promise<any> {
  return request(`/courses/${params.courseId}/reviews`, {
    method: 'POST',
    body: { rating: params.rating, comment: params.comment },
    auth: true,
  });
}

// ---- Messages ----

export async function fetchConversations(): Promise<any[]> {
  return request('/messages/conversations', { auth: true });
}

export async function fetchChatMessages(otherUserId: string): Promise<any[]> {
  return request(`/messages/${otherUserId}`, { auth: true });
}

// ---- Uploads ----

export async function uploadImage(fileUri: string): Promise<{ url: string }> {
  const formData = new FormData();
  const filename = fileUri.split('/').pop() ?? 'image.jpg';
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : 'image/jpeg';

  formData.append('file', {
    uri: fileUri,
    name: filename,
    type,
  } as any);

  const token = getAccessToken();
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE_URL}/uploads/image`, {
    method: 'POST',
    body: formData,
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Upload failed');
  }

  return response.json();
}

// ---- Payments ----

export async function createPaymentIntent(courseId: string): Promise<{
  clientSecret: string;
  paymentId: string;
  amount: number;
}> {
  return request('/payments/create-intent', { method: 'POST', body: { courseId }, auth: true });
}

export async function confirmPayment(paymentId: string): Promise<{ success: boolean; courseId: string }> {
  return request(`/payments/${paymentId}/confirm`, { method: 'POST', auth: true });
}

// ---- Student Dashboard ----

export async function fetchMyGrades(): Promise<any[]> {
  return request('/student/grades', { auth: true });
}

export async function fetchMyCalendar(): Promise<CalendarItem[]> {
  return request('/student/calendar', { auth: true });
}

export async function fetchMyNotifications(): Promise<AppNotification[]> {
  return request('/student/notifications', { auth: true });
}

// ---- Gamification ----

export async function fetchAchievements(): Promise<{
  streak: number;
  badges: Badge[];
}> {
  return request('/gamification/achievements', { auth: true });
}

export async function fetchLeaderboard(): Promise<Array<{
  id: string;
  name: string;
  avatarUrl?: string;
  streakCount: number;
  _count: { badges: number };
}>> {
  return request('/gamification/leaderboard', { auth: true });
}
