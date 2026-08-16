"use client";

import { useReducedMotion as useMotionReducedMotion } from "motion/react";

export function useReducedMotion(): boolean {
  return useMotionReducedMotion() === true;
}
