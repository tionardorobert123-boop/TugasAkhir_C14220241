import axios from "axios";

const LOCAL_API =
  "http://localhost:8000/api";

const CLOUD_API =
  "https://tugasakhirc14220241.up.railway.app/api";

const API = axios.create();

API.interceptors.request.use((config) => {

  // SWITCH API
  config.baseURL =
    navigator.onLine
      ? CLOUD_API
      : LOCAL_API;

  // TOKEN
  const token =
    localStorage.getItem("token");
  if (token) {
    config.headers.Authorization =
      `Bearer ${token}`;
  }
  return config;
});

export default API;