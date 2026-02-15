export interface AuthSignUpRequest {
  email: string;
  password: string;
  name?: string;
  metadata?: Record<string, any>;
}

export interface AuthSignInRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name?: string;
    createdAt: string;
    metadata?: Record<string, any>;
  };
  expiresAt: string;
}