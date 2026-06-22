export * from "./auth";
export * from "./users";
export * from "./transactions";
export * from "./insights";
export * from "./chats";
export * from "./pagination";
export * from "./accounts";
export * from "./plaid";
export {};

export type ServiceResult<T> =
  | { success: true; data: T }
  | {
      success: false;
      error: string;
      code?:
        | "DB_ERROR"
        | "NOT_FOUND"
        | "BAD_REQUEST"
        | "FORBIDDEN"
        | "INTERNAL_SERVER_ERROR"
        | "RATE_LIMITED"
        | "AI_ERROR"
        | "VALIDATION_ERROR"
        | "PARSE_ERROR"
        | "UNAUTHORIZED"
        | "CONFLICT";
    };
