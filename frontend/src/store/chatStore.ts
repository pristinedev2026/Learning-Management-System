import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import { API_BASE_URL } from '@/services/config';
import { getAccessToken } from './authStore';

interface ChatState {
  socket: Socket | null;
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  socket: null,
  isConnected: false,
  connect: () => {
    if (get().socket) return;

    const token = getAccessToken();
    if (!token) return;

    const socket = io(API_BASE_URL.replace('/api', ''), {
      auth: { token },
      transports: ['websocket'],
    });

    socket.on('connect', () => set({ isConnected: true }));
    socket.on('disconnect', () => set({ isConnected: false }));

    set({ socket });
  },
  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null, isConnected: false });
    }
  },
}));
