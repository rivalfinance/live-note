import { io, Socket } from 'socket.io-client';

// TODO: Use environment variable for SOCKET_URL in production
const SOCKET_URL = 'lhttp://localhost:5000';

class SocketService {
  private socket: Socket | null = null;

  connect() {
    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        withCredentials: true,
      });
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinNote(noteId: string) {
    this.socket?.emit('join-note', noteId);
  }

  leaveNote(noteId: string) {
    this.socket?.emit('leave-note', noteId);
  }

  emitNoteEdit(data: { noteId: string; title: string; content: string }) {
    this.socket?.emit('note-edit', data);
  }

  onNoteUpdate(callback: (data: any) => void) {
    this.socket?.on('note-update', callback);
  }

  offNoteUpdate(callback: (data: any) => void) {
    this.socket?.off('note-update', callback);
  }

  emitEditing(data: { noteId: string; user: { _id: string; name: string } }) {
    this.socket?.emit('editing', data);
  }

  onUserEditing(callback: (data: { user: { _id: string; name: string } }) => void) {
    this.socket?.on('user-editing', callback);
  }

  offUserEditing(callback: (data: { user: { _id: string; name: string } }) => void) {
    this.socket?.off('user-editing', callback);
  }
}

export const socketService = new SocketService(); 