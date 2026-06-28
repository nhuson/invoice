import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from 'react';
import {
  fetchProfile,
  login as loginRequest,
  register as registerRequest,
  RegisterPayload,
} from '../api/auth';
import { setUnauthorizedHandler, tokenStore } from '../api/client';
import { AuthUser } from '../types/invoice';

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    tokenStore.clear();
    setUser(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => setUser(null));
  }, []);

  useEffect(() => {
    const token = tokenStore.get();
    if (!token) {
      setLoading(false);
      return;
    }
    fetchProfile()
      .then(setUser)
      .catch(() => tokenStore.clear())
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { accessToken, user: profile } = await loginRequest(email, password);
    tokenStore.set(accessToken);
    setUser(profile);
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    const { accessToken, user: profile } = await registerRequest(payload);
    tokenStore.set(accessToken);
    setUser(profile);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, isAuthenticated: !!user, loading, login, register, logout }),
    [user, loading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
