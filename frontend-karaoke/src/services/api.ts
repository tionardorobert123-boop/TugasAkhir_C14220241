import axios from "axios";

const CLOUD_API =
  "https://tugasakhirc14220241.up.railway.app/api";

const LOCAL_API =
  "http://localhost:8000/api";

const API = axios.create({
  timeout: 10000,
});

// ================= TOKEN
API.interceptors.request.use(
  async (config) => {

    const token =
      localStorage.getItem("token");

    if (token) {

      config.headers.Authorization =
        `Bearer ${token}`;
    }

    // ================= LOCAL MQTT API
    if (
      config.url?.includes('/local/')
    ) {

      config.baseURL =
        LOCAL_API;

      console.log(
        '📡 LOCAL MQTT API'
      );

      return config;
    }

    // ================= CLOUD API
    config.baseURL =
      CLOUD_API;

    return config;
  }
);

export default API;