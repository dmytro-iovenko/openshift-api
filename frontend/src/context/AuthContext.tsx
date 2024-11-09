import React, { createContext, useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
// import { useSession } from "@toolpad/core";
import { type Session, SessionContext } from "@toolpad/core/AppProvider";
import { loginUser, signUpUser } from "../services/authService";
import Loader from "../components/Loader";

export interface UserSession extends Session {
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

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    console.log("Session", token, user);

    if (token && user) {
      setSession({ token, user });
    }
    setIsSessionLoaded(true);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await loginUser(email, password);
      const { token, user } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      setSession({ token, user });
      navigate("/applications");
    } catch (error: any) {
      setAuthError(error?.response?.data?.message || "Login failed. Please try again.");
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    try {
      const response = await signUpUser(email, password, name);
      const { token, user } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      setSession({ token, user });
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
    localStorage.removeItem("user");
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
