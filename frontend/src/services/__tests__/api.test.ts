import * as api from '../api';
import { API_BASE_URL } from '../config';

// Mock fetch
global.fetch = jest.fn();

describe('API Service', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  describe('Auth', () => {
    it('login should call fetch with correct params', async () => {
      const mockResponse = { user: { id: '1', name: 'Test User' }, accessToken: 'token' };
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        headers: { get: () => 'application/json' },
        json: async () => mockResponse,
      });

      const result = await api.login('1234567890', 'password');

      expect(fetch).toHaveBeenCalledWith(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: '1234567890', password: 'password' }),
      });
      expect(result).toEqual(mockResponse);
    });

    it('signUp should call fetch with correct params', async () => {
      const mockResponse = { user: { id: '1', name: 'New User' }, accessToken: 'token' };
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        headers: { get: () => 'application/json' },
        json: async () => mockResponse,
      });

      const result = await api.signUp('New User', '0987654321', 'password', 'student');

      expect(fetch).toHaveBeenCalledWith(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'New User', phone: '0987654321', password: 'password', role: 'student' }),
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('Courses', () => {
    it('fetchCourseCatalog should handle query parameters', async () => {
      const mockCourses = [{ id: '1', title: 'React Native' }];
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        headers: { get: () => 'application/json' },
        json: async () => mockCourses,
      });

      const result = await api.fetchCourseCatalog('React', 'Coding');

      expect(fetch).toHaveBeenCalledWith(`${API_BASE_URL}/courses?search=React&category=Coding`, expect.anything());
      expect(result).toEqual(mockCourses);
    });

    it('fetchCourseById should call correct endpoint', async () => {
      const mockCourse = { id: '123', title: 'Test Course' };
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        headers: { get: () => 'application/json' },
        json: async () => mockCourse,
      });

      const result = await api.fetchCourseById('123');

      expect(fetch).toHaveBeenCalledWith(`${API_BASE_URL}/courses/123`, expect.anything());
      expect(result).toEqual(mockCourse);
    });
  });

  describe('Error Handling', () => {
    it('should throw ApiError when response is not ok', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        headers: { get: () => 'application/json' },
        json: async () => ({ message: 'Unauthorized' }),
      });

      await expect(api.login('wrong', 'pass')).rejects.toThrow('Unauthorized');
    });

    it('should throw connection error when fetch fails', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network Error'));

      await expect(api.fetchMe()).rejects.toThrow(/Couldn't reach the server/);
    });
  });
});
