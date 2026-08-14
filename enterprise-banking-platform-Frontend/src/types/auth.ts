export interface AuthUser {
  id: string;
  username: string;
  email: string;
  roles: string[];
  permissions: string[];
}

export interface CurrentUserResponse extends AuthUser {}

export interface JwtPayload {
  exp?: number;
  sub?: string;
}
