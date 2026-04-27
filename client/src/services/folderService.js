import api from "./api";
export const uploadFolder = async (fileList, onProgress) => {
  const files = Array.from(fileList);
  const formData = new FormData();

  files.forEach((file) => {
    formData.append("files", file);
    // webkitRelativePath gives "Sample_folder/sub/image.jpeg"
    formData.append("relativePaths", file.webkitRelativePath || "");
  });

  const response = await api.post("/folders/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (e) => {
      if (onProgress && e.total) {
        const percent = Math.round((e.loaded * 100) / e.total);
        onProgress(percent);
      }
    },
  });
  return response.data;
};

export const getFolders = async () => {
  const response = await api.get("/folders");
  return response.data;
};
