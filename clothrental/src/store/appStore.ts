import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface RecentItem {
  id: string;
  slug: string;
  name: string;
  image?: string;
  pricePerDay: number;
  viewedAt: number;
}

interface AppStore {
  recentlyViewed: RecentItem[];
  addRecentlyViewed: (item: RecentItem) => void;
  clearRecentlyViewed: () => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      recentlyViewed: [],
      addRecentlyViewed: (item) =>
        set((state) => ({
          recentlyViewed: [
            item,
            ...state.recentlyViewed.filter((r) => r.id !== item.id),
          ].slice(0, 10),
        })),
      clearRecentlyViewed: () => set({ recentlyViewed: [] }),
    }),
    { name: 'clothrental-store' }
  )
);
