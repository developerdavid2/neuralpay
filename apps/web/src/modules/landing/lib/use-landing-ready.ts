"use client";
import { create } from "zustand";

type LandingReadyState = {
  ready: boolean;
  setReady: () => void;
};

export const useLandingReady = create<LandingReadyState>((set) => ({
  ready: false,
  setReady: () => set({ ready: true }),
}));
