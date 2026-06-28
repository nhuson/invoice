import { api } from './client';
import { AuthUser } from '../types/invoice';

export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}

export interface RegisterPayload {
  fullname: string;
  email: string;
  password: string;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>('/auth/login', { email, password });
  return data;
}

export async function register(payload: RegisterPayload): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>('/auth/register', payload);
  return data;
}

export async function fetchProfile(): Promise<AuthUser> {
  const { data } = await api.get<AuthUser>('/auth/me');
  return data;
}
