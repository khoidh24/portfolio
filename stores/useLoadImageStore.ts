import { create } from "zustand";

type State = {
  isReady: boolean;
  images: HTMLImageElement[];
  loadedImageCount: number;
};

type Action = {
  setIsReady: (ready: boolean) => void;
  setImages: (imgs: HTMLImageElement[]) => void;
  setLoadedImageCount: (count: number) => void;
};

export const useLoadImageStore = create<State & Action>((set) => ({
  isReady: false,
  images: [] as HTMLImageElement[],
  loadedImageCount: 0,
  setIsReady: (ready: boolean) => set(() => ({ isReady: ready })),
  setImages: (imgs: HTMLImageElement[]) => set({ images: imgs }),
  setLoadedImageCount: (count: number) => set({ loadedImageCount: count }),
}));
