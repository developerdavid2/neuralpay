export * from "./auth";
export * from "./users";
export * from "./transactions";
export * from "./insights";
export * from "./chats";
export * from "./pagination";
export * from "./accounts";
export * from "./plaid";
export * from "./notifications";
export * from "./location";
export * from "./security";
export {};

export type ServiceResult<T> =
  | { success: true; data: T; error?: never; code?: never }
  | {
      success: false;
      data?: never;
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
