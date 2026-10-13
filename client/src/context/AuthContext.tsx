import {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
  } from "react";
  
  interface AuthContextValue {
    token: string | null;
    isAuthenticated: boolean;
    authMessage: string;
    setAuthToken: (token: string) => void;
    logout: () => void;
    clearAuthMessage: () => void;
  }
  
  const AuthContext =
    createContext<AuthContextValue | undefined>(
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
  
    const [authMessage, setAuthMessage] = useState("");
  
    const setAuthToken = (newToken: string) => {
      localStorage.setItem("token", newToken);
      setToken(newToken);
      setAuthMessage("");
    };
  
    const logout = () => {
      localStorage.removeItem("token");
      setToken(null);
    };
  
    const clearAuthMessage = () => {
      setAuthMessage("");
    };
  
    useEffect(() => {
      const handleUnauthorized = (event: Event) => {
        const customEvent =
          event as CustomEvent<{
            message?: string;
          }>;
  
        localStorage.removeItem("token");
        setToken(null);
  
        setAuthMessage(
          customEvent.detail?.message ??
            "Please log in again."
        );
      };
  
      window.addEventListener(
        "auth:unauthorized",
        handleUnauthorized
      );
  
      return () => {
        window.removeEventListener(
          "auth:unauthorized",
          handleUnauthorized
        );
      };
    }, []);
  
    return (
      <AuthContext.Provider
        value={{
          token,
          isAuthenticated: Boolean(token),
          authMessage,
          setAuthToken,
          logout,
          clearAuthMessage,
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