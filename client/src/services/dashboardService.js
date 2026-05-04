import api from "./api";

// 🔹 Get overall dashboard stats (files count, etc.)
export const getDashboardStats = async () => {
  const response = await api.get("/dashboard/stats");
  return response.data;
};

// 🔹 Get storage stats (for donut chart)
export const getStorageStats = async () => {
  const response = await api.get("/dashboard/storage");
  return response.data;
};
