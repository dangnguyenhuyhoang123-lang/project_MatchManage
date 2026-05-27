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
      .catch((error) => {
        // Only clear user state if the error is 401 Unauthorized (token invalid/expired)
        // If it's 403 Forbidden (e.g., admin doesn't have access to /me) or network error, 
        // we keep the user state loaded from localStorage.
        if (error.response?.status === 401) {
          setUser(null);
        } else {
          console.warn("Lỗi khi tải thông tin user, sử dụng cache:", error);
        }
      })
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
