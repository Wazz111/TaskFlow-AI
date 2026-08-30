import { api } from "./api";

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export const login = async (data: LoginData) => {
  const response = await api("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });

  localStorage.setItem("token", response.token);

  return response;
};

export const register = async (data: RegisterData) => {
  return api("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const logout = () => {
  localStorage.removeItem("token");
};