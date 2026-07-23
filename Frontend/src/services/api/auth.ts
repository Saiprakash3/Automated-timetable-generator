import { api } from "./client";
import type { User, Role } from "@/types";

export interface LoginRequest {
  identifier: string;
  password: string;
  selectedRole: Role;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export interface RefreshTokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export const authApi = {
  login: (body: LoginRequest) => api.post<LoginResponse>("/auth/login", body),
  logout: () => api.post<{ success: true }>("/auth/logout"),
  refresh: (refreshToken: string) =>
    api.post<RefreshTokenResponse>("/auth/refresh", { refresh_token: refreshToken }),
  me: () => api.get<User>("/auth/me"),
};
