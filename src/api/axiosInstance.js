import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  // headers: {
  //   "Content-Type": "application/json",
  // },
});


export const api = axios.create({
  baseURL: "http://localhost:3000", // your backend
});


// Add interceptor to inject token from localStorage
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("partnerToken") || localStorage.getItem("token")
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
