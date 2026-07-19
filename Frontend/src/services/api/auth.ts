import { api } from "./client";
import type { User, Role } from "@/types";

export interface LoginRequest {
  identifier: string;
  password: string;
  selectedRole: Role;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export const authApi = {
  login: (body: LoginRequest) => api.post<LoginResponse>("/auth/login", body),
  logout: () => api.post<{ success: true }>("/auth/logout"),
  /** Restores a session on app load — same User shape as login's `user`. */
  me: () => api.get<User>("/auth/me"),
};
