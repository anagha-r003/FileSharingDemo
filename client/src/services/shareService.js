import api from "./api";

// Create share link
export const createShareLink = async (shareData) => {
  const response = await api.post("/share", shareData);
  return response.data;
};

// Resolve share link using token
export const resolveShareLink = async (token) => {
  const response = await api.get(`/share/${token}`);
  return response.data;
};

// Get all files shared by logged-in user
export const getMySharedFiles = async () => {
  const response = await api.get("/share/my-shares");
  return response.data;
};

// Revoke a share link
export const revokeShareLink = async (shareId) => {
  const response = await api.patch(`/share/revoke/${shareId}`);
  return response.data;
};

// View shared file
export const viewSharedFile = async (token) => {
  const response = await api.get(`/share/view/${token}`, {
    responseType: "blob",
  });
  return response;
};

// Download shared file
export const downloadSharedFile = async (token) => {
  const response = await api.get(`/share/download/${token}`, {
    responseType: "blob",
  });
  return response;
};
