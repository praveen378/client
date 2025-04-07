import axios from "axios";

const baseUrl = " http://localhost:3000/api/v1"; // Replace with your API base URL

export const axiosInstance = axios.create({
  baseURL: baseUrl, // Replace with your API base URL
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});
