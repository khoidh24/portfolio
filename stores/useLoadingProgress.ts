import { create } from "zustand";

type State = {
  percentNumber: number;
  isLoadingComplete: boolean;
  hasInitialLoadCompleted: boolean;
};

type Action = {
  setPercentNumber: (
    percentNumber: number | ((prev: number) => number),
  ) => void;
  setIsLoadingComplete: (isComplete: boolean) => void;
  setHasInitialLoadCompleted: (value: boolean) => void;
};

export const useLoadingProgressStore = create<State & Action>((set) => ({
  percentNumber: 0,
  isLoadingComplete: false,
  hasInitialLoadCompleted: false,
  setPercentNumber: (percentNumber) =>
    set((state) => ({
      percentNumber:
        typeof percentNumber === "function"
          ? percentNumber(state.percentNumber)
          : percentNumber,
    })),
  setIsLoadingComplete: (isComplete: boolean) =>
    set({ isLoadingComplete: isComplete }),
  setHasInitialLoadCompleted: (value: boolean) =>
    set({ hasInitialLoadCompleted: value }),
}));
