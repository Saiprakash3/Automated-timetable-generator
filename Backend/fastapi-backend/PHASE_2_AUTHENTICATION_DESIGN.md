# Phase 2: Authentication & JWT - Design Report

**Status:** Architecture Decision Document  
**Date:** 2026-07-21  

---

## CONFIGURATION SUMMARY

| Decision | Choice | Details |
|----------|--------|---------|
| **Failed Logins** | No lockout (simple) | Per API contract, unlimited attempts allowed |
| **Token Refresh** | With refresh tokens | Short access token + long refresh token (industry standard) |
| **Logout** | Blacklist invalidated tokens | Server-side token blacklist, enforced logout |
| **Frontend Integration** | Yes, update as we go | Build endpoint → update api/client.ts → test end-to-end |

---

## AUTHENTICATION FLOW

### Login Flow

```
1. Frontend: User enters credentials (identifier, password, selectedRole)
   ↓
2. Frontend: POST /api/auth/login
   {
     "identifier": "F1023",
     "password": "fac123",
     "selectedRole": "faculty"
   }
   ↓
3. Backend: Validate credentials
   - Find user by identifier
   - Verify password (bcrypt check)
   - Verify role matches
   - Generate tokens
   ↓
4. Backend: Return 200 OK
   {
     "access_token": "eyJhbGciOiJIUzI1NiIs...",
     "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
     "token_type": "bearer",
     "expires_in": 900,  (15 minutes)
     "user": {
       "id": "F1023",
       "name": "Dr. Ramesh Kumar",
       "role": "faculty",
       "department": "CSE"
     }
   }
   ↓
5. Frontend: Store tokens
   - access_token → localStorage (short-lived)
   - refresh_token → secure httpOnly cookie (long-lived)
   ↓
6. Frontend: On each request
   Authorization: Bearer {access_token}
```

---

## TOKEN STRATEGY

### Access Token
```
Purpose: Authenticate each request
Duration: 15 minutes
Storage: localStorage (vulnerable but convenient)
Payload:
{
  "sub": "F1023",        // user id
  "name": "Dr. Ramesh Kumar",
  "role": "faculty",
  "iat": 1726000000,     // issued at
  "exp": 1726000900      // expires in 15 min
}
```

### Refresh Token
```
Purpose: Get new access token when expired
Duration: 7 days
Storage: httpOnly secure cookie (more secure, harder to access from JS)
Payload:
{
  "sub": "F1023",
  "type": "refresh",
  "iat": 1726000000,
  "exp": 1726604800      // expires in 7 days
}

Rotation: Each refresh creates NEW refresh token (invalidates old one)
```

### Logout & Token Blacklist

When user logs out:
```
1. Frontend sends logout request with access_token
2. Backend adds access_token to BLACKLIST (Redis or in-memory)
3. Backend invalidates refresh_token (delete from DB or mark as revoked)
4. Any request with blacklisted token → 401 Unauthorized
5. Frontend clears localStorage and cookies
```

**Blacklist Storage Options:**
- ✅ **Redis** (best for production) - fast, distributed
- ✅ **In-memory dict** (okay for dev) - simple, lost on restart
- ✅ **Database** (worst) - slow, not ideal for frequent lookups

**For now: In-memory dict** (fast, good enough for testing)

---

## ENDPOINTS TO BUILD

### 1. POST /api/auth/login
```
Request:
{
  "identifier": "F1023",
  "password": "fac123",
  "selectedRole": "faculty"
}

Response 200:
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "token_type": "bearer",
  "expires_in": 900,
  "user": {
    "id": "F1023",
    "name": "Dr. Ramesh Kumar",
    "role": "faculty",
    "department": "CSE"
  }
}

Response 401 (invalid credentials):
{
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "The ID or password entered is incorrect."
  }
}

Response 401 (role mismatch):
{
  "error": {
    "code": "ROLE_MISMATCH",
    "message": "This account is not registered as faculty."
  }
}
```

### 2. POST /api/auth/logout
```
Request:
Authorization: Bearer {access_token}
(no body)

Response 200:
{
  "success": true,
  "message": "Logged out successfully"
}

Response 401 (invalid token):
{
  "error": {
    "code": "UNAUTHENTICATED",
    "message": "Missing or invalid token."
  }
}
```

### 3. GET /api/auth/me
```
Request:
Authorization: Bearer {access_token}

Response 200:
{
  "id": "F1023",
  "name": "Dr. Ramesh Kumar",
  "role": "faculty",
  "department": "CSE",
  "email": "ramesh@cse.edu"
}

Response 401 (invalid/expired token):
{
  "error": {
    "code": "UNAUTHENTICATED",
    "message": "Missing or invalid token."
  }
}
```

### 4. POST /api/auth/refresh
```
Request:
{
  "refresh_token": "eyJ..."
}

Response 200:
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",  (new refresh token)
  "token_type": "bearer",
  "expires_in": 900
}

Response 401 (invalid/expired refresh token):
{
  "error": {
    "code": "INVALID_REFRESH_TOKEN",
    "message": "Refresh token is invalid or expired."
  }
}
```

---

## FILES TO CREATE/UPDATE

### Backend Files

**New:**
- `app/schemas/auth.py` - Login/logout request/response schemas
- `app/api/auth.py` - Auth endpoints
- `app/services/auth_service.py` - Login/logout business logic
- `app/middleware/auth.py` - JWT token validation middleware
- `app/utils/tokens.py` - Token management (blacklist, revocation)

**Update:**
- `app/api/dependencies.py` - Add `get_current_user()` dependency
- `app/main.py` - Include auth routes

### Frontend Files

**Update:**
- `Frontend/src/services/api/client.ts` - Add login(), logout(), refresh() methods
- `Frontend/src/types/auth.ts` - Add auth response types (if doesn't exist)
- `Frontend/src/lib/auth.ts` - Add token storage/retrieval helpers

### Database

**No schema changes** - using existing User model

---

## IMPLEMENTATION APPROACH

### Step 1: Create Schemas (Pydantic)
```python
class LoginRequest(BaseModel):
    identifier: str
    password: str
    selectedRole: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    user: dict
```

### Step 2: Create Auth Service
```python
class AuthService:
    def login(identifier, password, selected_role):
        # Find user
        # Verify password
        # Verify role
        # Generate tokens
        # Return response
    
    def logout(token):
        # Add token to blacklist
        # Return success
    
    def get_current_user(token):
        # Validate token
        # Check blacklist
        # Return user
```

### Step 3: Create Auth Endpoints
```python
@router.post("/auth/login")
async def login(request: LoginRequest):
    return await auth_service.login(...)

@router.post("/auth/logout")
async def logout(token: str = Depends(get_token)):
    return await auth_service.logout(token)

@router.get("/auth/me")
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user
```

### Step 4: Create Middleware
```python
async def verify_token(token: str):
    # Decode JWT
    # Check blacklist
    # Return user or raise 401
    pass
```

### Step 5: Update Frontend
```typescript
// api/client.ts
export const login = async (identifier, password, role) => {
    const response = await api.post("/auth/login", {
        identifier,
        password,
        selectedRole: role
    });
    return response.data;
}

export const logout = async () => {
    await api.post("/auth/logout");
    clearTokens();
}

export const getMe = async () => {
    return await api.get("/auth/me");
}
```

---

## SECURITY CONSIDERATIONS

### ✅ Implemented
- Passwords hashed with bcrypt (12 rounds)
- JWT signed with secret key
- 15-min access token expiry (low risk if stolen)
- 7-day refresh token with rotation
- Token blacklist on logout (prevents token reuse)
- Role validation on server (not trusting client)
- Password never returned in responses

### ⚠️ Not Implemented (Out of Scope)
- Account lockout (per API contract)
- Password reset (admin-issued only per contract)
- Multi-factor authentication
- HTTPS/TLS (assumed in production)
- CSRF protection (not needed for stateless JWT)
- Rate limiting (can add later)

---

## TEST USERS FOR PHASE 2

```
Admin:           A001 / admin123
HOD:             H001 / hod123
Faculty:         F1023 / fac123
Lab Coordinator: LC004 / labco123
Student:         S3021 / stu123
```

All users created in Phase 1, passwords hashed and ready.

---

## FLOW DIAGRAM

```
Frontend                          Backend
  │                                 │
  ├─ User enters credentials ──────→│
  │                                 ├─ Verify credentials
  │                                 ├─ Generate tokens
  │                                 ├─ Add to token store
  │←─ Return access_token + user ──┤
  │                                 │
  ├─ Store tokens locally           │
  │                                 │
  ├─ GET /api/timetables ──────────→│
  │   (with access_token)           ├─ Verify token
  │                                 ├─ Check blacklist
  │                                 ├─ Return timetables
  │←─ Return data ────────────────┤
  │                                 │
  ├─ POST /api/auth/logout ───────→│
  │   (with access_token)           ├─ Blacklist token
  │                                 ├─ Revoke refresh
  │←─ Success ──────────────────────┤
  │                                 │
  ├─ Clear tokens                   │
  └─ Redirect to login
```

---

## READY TO IMPLEMENT PHASE 2?

**Decisions confirmed:**
- ✅ No login lockout (simple approach)
- ✅ JWT with refresh tokens (industry standard)
- ✅ Token blacklist on logout (enforced logout)
- ✅ Update frontend api/client.ts as we build (end-to-end testing)

**Expected outcome:**
- 4 auth endpoints working
- Frontend can login/logout
- Protected endpoints require valid token
- Tokens expire and refresh correctly
- Full end-to-end auth flow tested

---

**Ready to proceed? 🚀**
