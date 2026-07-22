// Matches the backend auth contract (see CLAUDE.md).

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

// POST /api/auth/register and /api/auth/login both return this.
export interface AuthResponse {
  token: string;
  email: string;
  username: string;
}

// What we keep in memory about the logged-in user (no token here).
export interface CurrentUser {
  email: string;
  username: string;
}
