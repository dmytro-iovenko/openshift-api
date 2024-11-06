import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export const loginUser = async (email: string, password: string) => {
  return axios.post(`${API_BASE_URL}/api/auth/login`, { email, password });
};

export const signUpUser = async (email: string, password: string, name: string) => {
  return axios.post(`${API_BASE_URL}/api/auth/signup`, { email, password, name });
};
