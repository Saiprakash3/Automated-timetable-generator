# Frontend API Integration - Phase 2

**Note:** Backend-only session prevents direct frontend edits. Here's what to update:

---

## Update: `Frontend/src/services/api/client.ts`

Add this code after the existing `api` object (around line 48):

```typescript
// Authentication API methods
export const authApi = {
  /**
   * Login with credentials
   * Returns access_token, refresh_token, and user info
   */
  login: async (identifier: string, password: string, selectedRole: string) => {
    return api.post("/auth/login", {
      identifier,
      password,
      selectedRole,
    });
  },

  /**
   * Logout current user
   * Blacklists the access token
   */
  logout: async () => {
    return api.post("/auth/logout");
  },

  /**
   * Get current authenticated user
   * Requires valid access token
   */
  getMe: async () => {
    return api.get("/auth/me");
  },

  /**
   * Refresh access token using refresh token
   * Returns new access_token and refresh_token
   */
  refresh: async (refreshToken: string) => {
    return api.post("/auth/refresh", {
      refresh_token: refreshToken,
    });
  },
};
```

---

## Files Updated in Frontend

✅ `Frontend/src/services/api/client.ts` - Add auth methods (manual update needed)

---

## Types to Update/Create

If doesn't exist, create `Frontend/src/types/auth.ts`:

```typescript
export interface LoginRequest {
  identifier: string;
  password: string;
  selectedRole: string;
}

export interface User {
  id: string;
  name: string;
  role: string;
  department: string;
  email?: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export interface RefreshResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}
```

---

## Update useSession Hook

If it exists, update `Frontend/src/hooks/useSession.ts` to handle new token responses:

```typescript
export const setTokens = (accessToken: string, refreshToken: string) => {
  localStorage.setItem("access_token", accessToken);
  localStorage.setItem("refresh_token", refreshToken);
};

export const getRefreshToken = () => {
  return localStorage.getItem("refresh_token");
};

export const clearTokens = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
};
```

---

## Ready to Test

Once frontend updates are done:

1. Backend API running: `poetry run uvicorn app.main:app --reload`
2. Frontend dev server running
3. Test login: Open `http://localhost:5173` → Login form
4. Test credentials:
   - Admin: A001 / admin123
   - Faculty: F1023 / fac123
   - HOD: H001 / hod123
