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
  return api("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const register = async (data: RegisterData) => {
  return api("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
};