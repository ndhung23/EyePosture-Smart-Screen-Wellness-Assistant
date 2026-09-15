export type UserRole = 'USER' | 'ADMIN' | 'PARENT';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status?: 'ACTIVE' | 'BLOCKED';
  isBlocked?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Device {
  id: string;
  userId: string;
  deviceFingerprint: string;
  deviceName: string;
  os: string;
  appVersion: string;
  status?: 'ACTIVE' | 'BLOCKED';
  isBlocked?: boolean;
  lastActiveAt: string;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}
