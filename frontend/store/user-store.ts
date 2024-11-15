import { User } from '@/models/user';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface UserState {
  loginDetails: User | null;
  setLoginDetails: (val: User) => void;
  clearLoginDetails: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      loginDetails: null,
      setLoginDetails: (value: User) => set({ loginDetails: value }),
      clearLoginDetails: () => set({ loginDetails: null }),
    }),
    { name: 'user-store', storage: createJSONStorage(() => sessionStorage) }
  )
);
