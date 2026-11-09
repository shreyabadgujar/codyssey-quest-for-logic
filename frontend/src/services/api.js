import axios from "axios";

// Single Axios instance. All API calls go through service modules using this.
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || "/api" });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("codyssey_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Normalise to the contract: { error: { message, code } }
api.interceptors.response.use(
  (res) => res.data.data ?? res.data,
  (err) => Promise.reject(err.response?.data?.error ?? { message: err.message, code: "NETWORK_ERROR" })
);

export default api;
