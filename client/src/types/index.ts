export interface User {
  id: number;
  username: string;
  email?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

export interface Employee {
  id: number;
  user_id: number;
  name: string;
  gender?: string;
  birthday?: string;
  hire_date?: string;
  position?: string;
  salary?: number;
  photo?: string;
  status: string;
  created_at: string;
  updated_at: string;
  username: string;
  email?: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  user: User;
}

export interface RegisterResponse {
  message: string;
  userId: number;
}