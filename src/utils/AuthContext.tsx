import {
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { getCurrentUser } from "../services/UserAccountAPI";
import UserService from "../services/UserService";
import CurrentUser from "./CurrentUser";
import { AuthContext, type User } from "./AuthContextCore";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUserState] = useState<User | null>(() => CurrentUser.getUser());
  const [loading, setLoading] = useState(true);

  const setUser = (nextUser: User | null) => {
    CurrentUser.setUser(nextUser);
    setUserState(nextUser);
  };

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
