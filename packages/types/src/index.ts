export * from "./auth";
export * from "./users";
export * from "./transactions";
export * from "./ai";
export * from "./pagination";
export {};

export type ServiceResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; code: string };
