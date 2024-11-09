import * as JWT from "jwt-decode";
import React, { createContext, useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { type Session, SessionContext } from "@toolpad/core/AppProvider";
import { loginUser, signUpUser } from "../services/authService";
import Loader from "../components/Loader";

interface UserSession extends Session {
  token: string | null;
}

interface AuthContextType {
  user: any;
  token: string | null;
  login: (email: string, password: string) => void;
  logout: () => void;
  signup: (email: string, password: string, name: string) => void;
  error: string | null;
  setError: (message: string | null) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<UserSession | null>(null);
  const [isSessionLoaded, setIsSessionLoaded] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Function to check if token is expired
  const isTokenExpired = (token: string): boolean => {
    try {
      const decoded: any = JWT.jwtDecode(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp < currentTime;
    } catch (error) {
      console.error("Failed to decode JWT", error);
      return true;
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      isTokenExpired(token) && logout();
      const decoded: any = JWT.jwtDecode(token);
      setSession({ token, user: decoded.user });
    }
    setIsSessionLoaded(true);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await loginUser(email, password);
      const { token } = response.data;
      localStorage.setItem("token", token);
      const decoded: any = JWT.jwtDecode(token);
      setSession({ token, user: decoded.user });
      navigate("/applications");
    } catch (error: any) {
      setAuthError(error?.response?.data?.message || "Login failed. Please try again.");
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    try {
      const response = await signUpUser(email, password, name);
      const { token } = response.data;
      localStorage.setItem("token", token);
      const decoded: any = JWT.jwtDecode(token);
      setSession({ token, user: decoded.user });
      navigate("/applications");
    } catch (error: any) {
      if (error?.response?.data?.errors) {
        setAuthError(
          error?.response?.data?.errors.map((err: any) => err.msg).join(", ") || "Signup failed. Please try again."
        );
      } else {
        setAuthError(error?.response?.data?.message || "Signup failed. Please try again.");
      }
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setSession(null);
    navigate("/login");
  };

  if (!isSessionLoaded) {
    return <Loader />;
  }

  return (
    <AuthContext.Provider
      value={{
        user: session?.user,
        token: session?.token!,
        login,
        logout,
        signup,
        error: authError,
        setError: setAuthError,
      }}>
      <SessionContext.Provider value={session}>{children}</SessionContext.Provider>
    </AuthContext.Provider>
  );
};
