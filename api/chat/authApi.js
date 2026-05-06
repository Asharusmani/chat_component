import api from "../index";

export const login = async (email, password) => {
  const response = await api.post("/auth/login", { email, password });
  return response.data;
};

export const register = async ({ firstName, lastName, email, password, confirmPassword }) => {
  const response = await api.post("/auth/register", {
    firstName,
    lastName,
    email,
    password,
    confirmPassword,
  });
  return response.data;
};

export const forgotPassword = async (email) => {
  const response = await api.post("/auth/forgot-password", { email });
  return response.data;
};

export const resetPassword = async (token, password) => {
  // backend schema field name is "password", not "newPassword"
  const response = await api.post("/auth/reset-password", { token, password });
  return response.data;
};

export const changePassword = async (currentPassword, newPassword, confirmPassword) => {
  const response = await api.patch("/auth/change-password", {
    currentPassword,
    newPassword,
    confirmPassword,
  });
  return response.data;
};