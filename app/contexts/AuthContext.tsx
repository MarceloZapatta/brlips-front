import { createContext, useContext, useEffect, useState } from "react";
import { useRouter, useSegments } from "expo-router";
import authService from "../services/auth-service";

interface AuthContextType {
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({ isAuthenticated: false });

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const isAuthed = authService.isAuthenticated();
      setIsAuthenticated(isAuthed);

      const inAuthGroup = segments[0] === "(auth)";

      console.log(isAuthed, inAuthGroup);

      if (isAuthed && inAuthGroup) {
        // Redirect authenticated users to home if they're on auth pages
        router.replace("/home");
      } else if (!isAuthed && segments[0] !== "(auth)") {
        // Redirect unauthenticated users to login
        router.replace("/");
      }
    };

    checkAuth();
  }, [segments]);

  return (
    <AuthContext.Provider value={{ isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}
