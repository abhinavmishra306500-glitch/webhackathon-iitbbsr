export type UserRole = 'admin' | 'coordinator' | 'faculty' | 'club_rep';

export interface RoleInfo {
  id: UserRole;
  label: string;
  badge: string;
  color: string;
  defaultEmail: string;
  defaultRegId: string;
  description: string;
}

export interface UserSession {
  name: string;
  email: string;
  regId: string;
  role: UserRole;
  department: string;
  title: string;
  avatar: string;
  lastLogin: string;
  token: string;
  permissions: string[];
  office: string;
}

export interface LoginFormState {
  regIdOrEmail: string;
  password: string;
  rememberMe: boolean;
  selectedRole: UserRole;
}
