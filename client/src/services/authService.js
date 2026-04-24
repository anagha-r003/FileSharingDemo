import api from "./api";
import axios from "axios";

export const registerUser = async (userData) => {
  const response = await axios.post(
    "http://localhost:8080/auth/register",
    userData,
  );
  return response.data;
};

export const loginUser = async (loginData) => {
  const response = await axios.post(
    "http://localhost:8080/auth/login",
    loginData,
  );
  return response.data;
};

export const logoutUser = async () => {
  const refreshToken = localStorage.getItem("refreshToken");
  try {
    // Tell backend to invalidate refresh token
    await api.post("/auth/logout", { refreshToken });
  } catch {
    // Even if backend call fails, clear local storage
  }
  localStorage.clear();
};

// export const getStats = async () => {
//   const response = await api.get("/dashboard/stats");
//   return response.data;
// };

// export const getRecentActivity = async () => {
//   const response = await api.get("/dashboard/activity");
//   return response.data;
// };
