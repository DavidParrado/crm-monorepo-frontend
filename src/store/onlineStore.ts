import { create } from 'zustand';

interface OnlineStatusState {
  onlineUsers: Set<number>;
  
  // Actions
  setOnline: (userId: number) => void;
  setOffline: (userId: number) => void;
  
  // Helper for UI usage
  isUserOnline: (userId: number) => boolean;
}

export const useOnlineStore = create<OnlineStatusState>((set, get) => ({
  onlineUsers: new Set(),

  setOnline: (id) => 
    set((state) => {
      const newSet = new Set(state.onlineUsers);
      newSet.add(id);
      return { onlineUsers: newSet };
    }),

  setOffline: (id) => 
    set((state) => {
      const newSet = new Set(state.onlineUsers);
      newSet.delete(id);
      return { onlineUsers: newSet };
    }),

  isUserOnline: (id) => get().onlineUsers.has(id),
}));
