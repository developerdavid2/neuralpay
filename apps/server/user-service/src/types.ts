import type { Request } from "express";
import type { ServiceResponse, User } from "@neuralpay/types";

export interface RequestWithUser extends Request {
  user?: User;
}

export type AuthenticatedRequest = RequestWithUser & { user: User };
export type AuthServiceResponse<T> = ServiceResponse<T>;
