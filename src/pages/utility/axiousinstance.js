import axios from "axios";

const baseUrl = import.meta.env.VITE_BASE_URL; // Replace with your API base URL

export const axiosInstance = axios.create({
  baseURL: baseUrl, // Replace with your API base URL
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});
