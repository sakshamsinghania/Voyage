import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api, AuthError, type User } from "./api";

type Status = "loading" | "authed" | "anon";

interface AuthContextValue {
  user: User | null;
  status: Status;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const u = await api.me();
        if (!cancelled) {
          setUser(u);
          setStatus("authed");
        }
      } catch (e) {
        if (cancelled) return;
        if (e instanceof AuthError) {
          setUser(null);
          setStatus("anon");
        } else {
          setUser(null);
          setStatus("anon");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const u = await api.login(email, password);
    setUser(u);
    setStatus("authed");
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    const u = await api.register(email, password);
    setUser(u);
    setStatus("authed");
  }, []);

  const signOut = useCallback(async () => {
    try {
      await api.logout();
    } finally {
      setUser(null);
      setStatus("anon");
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, status, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth outside AuthProvider");
  return ctx;
}
