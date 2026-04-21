import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type User = {
  id?: number;
  username: string;
  roles: string[];
  fullName?: string;
  displayName?: string;
  email?: string;
  phone?: string;
};

type AuthType = {
  user: User | null;
  setUser: (u: User | null) => void;
  loading: boolean;
};

const AuthContext = createContext<AuthType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // load user khi reload trang
  useEffect(() => {
    fetch("http://localhost:8080/api/user-account/me", {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => setUser(data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext)!;
