import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { getCurrentUser } from "../services/UserAccountAPI";
import UserService from "../services/UserService";

export type User = {
  id?: number;
  username: string;
  roles: string[];
  fullName?: string;
  displayName?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  teamId?: number;
};

type AuthType = {
  user: User | null;
  setUser: (u: User | null) => void;
  loading: boolean;
  logout: () => void;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
};

const AuthContext = createContext<AuthType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCurrentUser()
      .then((data) => setUser(data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const logout = () => {
    UserService.logout();
    setUser(null);
  };

  const hasRole = (role: string) => {
    return user?.roles?.includes(role) ?? false;
  };

  const hasAnyRole = (roles: string[]) => {
    return roles.some((role) => user?.roles?.includes(role));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        logout,
        hasRole,
        hasAnyRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
