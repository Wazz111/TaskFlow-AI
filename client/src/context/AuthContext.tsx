import {
    createContext,
    ReactNode,
    useContext,
    useState,
  } from "react";
  
  interface AuthContextValue {
    token: string | null;
    isAuthenticated: boolean;
    setAuthToken: (token: string) => void;
    logout: () => void;
  }
  
  const AuthContext = createContext<AuthContextValue | undefined>(
    undefined
  );
  
  interface AuthProviderProps {
    children: ReactNode;
  }
  
  export function AuthProvider({
    children,
  }: AuthProviderProps) {
    const [token, setToken] = useState<string | null>(() =>
      localStorage.getItem("token")
    );
  
    const setAuthToken = (newToken: string) => {
      localStorage.setItem("token", newToken);
      setToken(newToken);
    };
  
    const logout = () => {
      localStorage.removeItem("token");
      setToken(null);
    };
  
    return (
      <AuthContext.Provider
        value={{
          token,
          isAuthenticated: Boolean(token),
          setAuthToken,
          logout,
        }}
      >
        {children}
      </AuthContext.Provider>
    );
  }
  
  export function useAuth() {
    const context = useContext(AuthContext);
  
    if (!context) {
      throw new Error(
        "useAuth must be used inside AuthProvider"
      );
    }
  
    return context;
  }