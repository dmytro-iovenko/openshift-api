import React, { createContext, useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, signUpUser } from "../services/authService";

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
  const [user, setUser] = useState<any>(() => {
    if (localStorage.getItem("token")) {
      return JSON.parse(localStorage.getItem("user")!) || null;
    }
  });
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [authError, setAuthError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Set the user from localStorage if there's a token
    if (token) {
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      setUser(storedUser);
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    try {
      const response = await loginUser(email, password);
      const { token, user } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      setToken(token);
      setUser(user);
      navigate("/applications"); // Redirect to applications page
    } catch (error: any) {
      setAuthError(error?.response?.data?.message || "Login failed. Please try again.");
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    try {
      const response = await signUpUser(email, password, name);
      console.log("Response", response.data);
      const { token, user } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      setToken(token);
      setUser(user);
      navigate("/applications");
    } catch (error: any) {
      console.log("Error", error);
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
    setToken(null);
    setUser(null);
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, signup, error: authError, setError: setAuthError }}>
      {children}
    </AuthContext.Provider>
  );
};
