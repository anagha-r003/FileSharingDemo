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

export const deleteFile = async (fileId) => {
  const response = await api.delete(`/files/delete/${fileId}`);
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

export const createShareLink = async (fileId, options = {}) => {
  const response = await api.post(`/files/${fileId}/share`, options);
  return response.data;
};

export const getShareLinks = async (fileId) => {
  const response = await api.get(`/files/${fileId}/shares`);
  return response.data;
};
