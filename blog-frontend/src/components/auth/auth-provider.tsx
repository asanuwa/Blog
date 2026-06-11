"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { tokenStorage } from "@/lib/token-storage";

type AuthUser = {
  id: string;
  name?: string;
  email?: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setSession: (session: {
    accessToken: string;
    refreshToken?: string;
    user?: AuthUser | null;
  }) => void;
  clearSession: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(() =>
    tokenStorage.getAccessToken(),
  );
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    function handleUnauthorized() {
      tokenStorage.clear();
      setAccessToken(null);
      setUser(null);
    }

    window.addEventListener("api:unauthorized", handleUnauthorized);

    return () => {
      window.removeEventListener("api:unauthorized", handleUnauthorized);
    };
  }, []);

  const setSession = useCallback<AuthContextValue["setSession"]>((session) => {
    tokenStorage.setAccessToken(session.accessToken);

    if (session.refreshToken) {
      tokenStorage.setRefreshToken(session.refreshToken);
    }

    setAccessToken(session.accessToken);
    setUser(session.user ?? null);
  }, []);

  const clearSession = useCallback(() => {
    tokenStorage.clear();
    setAccessToken(null);
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      accessToken,
      isAuthenticated: Boolean(accessToken),
      setSession,
      clearSession,
    }),
    [accessToken, clearSession, setSession, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
