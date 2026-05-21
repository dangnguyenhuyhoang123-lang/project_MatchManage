import { createContext } from "react";
import type { AuthUser } from "../types/AuthUser";

export type User = AuthUser;

export type AuthType = {
  user: User | null;
  setUser: (u: User | null) => void;
  loading: boolean;
  logout: () => void;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
};

export const AuthContext = createContext<AuthType | null>(null);
