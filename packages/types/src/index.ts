export * from "./auth";
export * from "./users";
export {};

export type ServiceResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; code: string };
