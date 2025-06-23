import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, clear storage
      await AsyncStorage.multiRemove(['authToken', 'userData']);
      // You might want to redirect to login here
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  register: async (email: string, password: string, name: string) => {
    const response = await api.post('/auth/register', { email, password, name });
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// Chat API
export const chatAPI = {
  getConversations: async () => {
    const response = await api.get('/chat/conversations');
    return response.data;
  },

  getMessages: async (conversationId: string, page = 1, limit = 50) => {
    const response = await api.get(`/chat/conversations/${conversationId}/messages`, {
      params: { page, limit }
    });
    return response.data;
  },

  sendMessage: async (conversationId: string, content: string, messageType = 'text') => {
    const response = await api.post(`/chat/conversations/${conversationId}/messages`, {
      content,
      messageType
    });
    return response.data;
  },

  createConversation: async (type: string, participantIds: string[], name?: string) => {
    const response = await api.post('/chat/conversations', {
      type,
      participantIds,
      name
    });
    return response.data;
  },
};

// Calls API
export const callsAPI = {
  initiateCall: async (conversationId: string, callType: 'voice' | 'video') => {
    const response = await api.post('/calls/initiate', {
      conversationId,
      callType
    });
    return response.data;
  },

  answerCall: async (callId: string) => {
    const response = await api.post(`/calls/${callId}/answer`);
    return response.data;
  },

  declineCall: async (callId: string) => {
    const response = await api.post(`/calls/${callId}/decline`);
    return response.data;
  },

  endCall: async (callId: string) => {
    const response = await api.post(`/calls/${callId}/end`);
    return response.data;
  },

  getCallHistory: async (page = 1, limit = 20) => {
    const response = await api.get('/calls/history', {
      params: { page, limit }
    });
    return response.data;
  },
};

export default api;
