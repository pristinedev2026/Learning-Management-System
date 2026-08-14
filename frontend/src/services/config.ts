/**
 * Expo only exposes environment variables prefixed EXPO_PUBLIC_ to app
 * code. Set EXPO_PUBLIC_API_URL in a .env file at the project root (see
 * .env.example) and restart `expo start` after changing it.
 */
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:3000/api';
