import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SOCKET_URL = process.env.EXPO_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3001';

class SocketService {
  private socket: Socket | null = null;
  private isConnected = false;

  connect = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      
      if (!token) {
        console.log('No auth token found, cannot connect to socket');
        return;
      }

      this.socket = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        timeout: 10000,
      });

      this.socket.on('connect', () => {
        console.log('✅ Connected to socket server');
        this.isConnected = true;
        
        // Authenticate with the server
        this.socket?.emit('authenticate', token);
      });

      this.socket.on('authenticated', (data) => {
        console.log('✅ Socket authenticated:', data.user.name);
      });

      this.socket.on('authentication_error', (error) => {
        console.error('❌ Socket authentication failed:', error);
        this.disconnect();
      });

      this.socket.on('disconnect', () => {
        console.log('❌ Disconnected from socket server');
        this.isConnected = false;
      });

      this.socket.on('connect_error', (error) => {
        console.error('❌ Socket connection error:', error);
        this.isConnected = false;
      });

    } catch (error) {
      console.error('Socket connection error:', error);
    }
  };

  disconnect = () => {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      console.log('🔌 Socket disconnected');
    }
  };

  // Chat functionality
  joinConversation = (conversationId: string) => {
    this.socket?.emit('join_conversation', conversationId);
  };

  leaveConversation = (conversationId: string) => {
    this.socket?.emit('leave_conversation', conversationId);
  };

  onNewMessage = (callback: (message: any) => void) => {
    this.socket?.on('new_message', callback);
  };

  offNewMessage = () => {
    this.socket?.off('new_message');
  };

  // Typing indicators
  startTyping = (conversationId: string) => {
    this.socket?.emit('typing_start', { conversationId });
  };

  stopTyping = (conversationId: string) => {
    this.socket?.emit('typing_stop', { conversationId });
  };

  onUserTyping = (callback: (data: any) => void) => {
    this.socket?.on('user_typing', callback);
  };

  onUserStopTyping = (callback: (data: any) => void) => {
    this.socket?.on('user_stop_typing', callback);
  };

  // Call functionality
  joinCall = (callId: string) => {
    this.socket?.emit('join_call', callId);
  };

  leaveCall = (callId: string) => {
    this.socket?.emit('leave_call', callId);
  };

  onIncomingCall = (callback: (callData: any) => void) => {
    this.socket?.on('incoming_call', callback);
  };

  onCallAnswered = (callback: (data: any) => void) => {
    this.socket?.on('call_answered', callback);
  };

  onCallDeclined = (callback: (data: any) => void) => {
    this.socket?.on('call_declined', callback);
  };

  onCallEnded = (callback: (data: any) => void) => {
    this.socket?.on('call_ended', callback);
  };

  // WebRTC signaling
  sendCallOffer = (callId: string, offer: any) => {
    this.socket?.emit('call_offer', { callId, offer });
  };

  sendCallAnswer = (callId: string, answer: any) => {
    this.socket?.emit('call_answer', { callId, answer });
  };

  sendIceCandidate = (callId: string, candidate: any) => {
    this.socket?.emit('ice_candidate', { callId, candidate });
  };

  onCallOffer = (callback: (data: any) => void) => {
    this.socket?.on('call_offer', callback);
  };

  onCallAnswer = (callback: (data: any) => void) => {
    this.socket?.on('call_answer', callback);
  };

  onIceCandidate = (callback: (data: any) => void) => {
    this.socket?.on('ice_candidate', callback);
  };

  // User presence
  onUserOnline = (callback: (data: any) => void) => {
    this.socket?.on('user_online', callback);
  };

  onUserOffline = (callback: (data: any) => void) => {
    this.socket?.on('user_offline', callback);
  };

  // Utility methods
  isSocketConnected = () => {
    return this.isConnected && this.socket?.connected;
  };

  getSocket = () => {
    return this.socket;
  };
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;
