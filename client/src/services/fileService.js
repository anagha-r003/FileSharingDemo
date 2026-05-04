import api from "./api";

export const uploadFile = async (file, onProgress) => {
  const formData = new FormData();
  formData.append("files", file);

  const response = await api.post("/files/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (e) => {
      if (onProgress) {
        const percent = Math.round((e.loaded * 100) / e.total);
        onProgress(percent);
      }
    },
  });
  return response.data;
};

export const getFiles = async () => {
  const response = await api.get("/files");
  return response.data;
};

export const viewFile = async (fileId) => {
  const response = await api.get(`/files/view/${fileId}`, {
    responseType: "blob",
  });

  const url = window.URL.createObjectURL(new Blob([response.data]));
  return url;
};

export const deleteFile = async (fileId) => {
  const response = await api.delete(`/files/${fileId}`);
  return response.data;
};

export const getDeletedFiles = async () => {
  const response = await api.get(`/files/recycle-bin`);
  return response.data;
};

export const restoreFile = async (fileId) => {
  const response = await api.put(`/files/restore/${fileId}`);
  return response.data;
};

export const permanentlyDeleteFile = async (fileId) => {
  const response = await api.delete(`/files/permanent/${fileId}`);
  return response.data;
};

export const restoreAllFiles = async () => {
  const response = await api.put(`/files/restore-all`);
  return response.data;
};

export const emptyRecycleBin = async () => {
  const response = await api.delete(`/files/empty-bin`);
  return response.data;
};

export const getRecycleBinStats = async () => {
  const response = await api.get(`/files/recycle-bin/stats`);
  return response.data;
};

export const downloadFile = async (fileId, fileName) => {
  const response = await api.get(`/files/download/${fileId}`, {
    responseType: "blob",
  });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const starFile = async (fileId) => {
  const response = await api.put(`/files/star/${fileId}`);
  return response.data;
};

export const unstarFile = async (fileId) => {
  const response = await api.put(`/files/unstar/${fileId}`);
  return response.data;
};

export const getStarredFiles = async () => {
  const response = await api.get("/files/starred");
  return response.data;
};

export const createShareLink = async (fileId, options = {}) => {
  const response = await api.post(`/files/${fileId}/share`, options);
  return response.data;
};

export const getShareLinks = async (fileId) => {
  const response = await api.get(`/files/${fileId}/shares`);
  return response.data;
};

