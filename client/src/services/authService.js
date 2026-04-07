import axios from "axios";

const BASE_URL = "http://localhost:8080/auth";

export const registerUser = async (userData) => {
  const response = await axios.post(`${BASE_URL}/register`, userData);
  return response.data;
};
