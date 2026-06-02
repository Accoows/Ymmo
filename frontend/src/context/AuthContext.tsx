import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import type { User } from "../types";
import { login as apiLogin, getMe } from "../lib/api";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  canManage: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem("pi_token")
  );
  const [isLoading, setIsLoading] = useState(!!localStorage.getItem("pi_token"));

  useEffect(() => {
    const storedToken = localStorage.getItem("pi_token");
    if (!storedToken) {
      setIsLoading(false);
      return;
    }
    getMe()
      .then(setUser)
      .catch(() => {
        localStorage.removeItem("pi_token");
        localStorage.removeItem("pi_user");
        setToken(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { user, token } = await apiLogin(email, password);
    localStorage.setItem("pi_token", token);
    setToken(token);
    setUser(user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("pi_token");
    localStorage.removeItem("pi_user");
    setToken(null);
    setUser(null);
  }, []);

  const canManage =
    user?.role === "Admin" ||
    user?.role === "Superadmin" ||
    user?.role === "AgencyHead";

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user,
        canManage,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
