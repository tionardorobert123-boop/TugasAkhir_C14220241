import axios from "axios";

const LOCAL_API =
  "http://localhost:8000/api";

const CLOUD_API =
  "https://tugasakhirc14220241.up.railway.app/api";

const API = axios.create({
  timeout: 5000,
});

// DETECT API
async function getAvailableAPI() {

  try {

    await axios.get(
      `${CLOUD_API}/ping`,
      {
        timeout: 2000,
      }
    );

    return CLOUD_API;

  } catch (error) {

    console.log(
      "Cloud unavailable, switch local API"
    );

    return LOCAL_API;
  }
}

// INTERCEPTOR
API.interceptors.request.use(
  async (config) => {

    // AUTO SWITCH
    config.baseURL =
      await getAvailableAPI();

    // TOKEN
    const token =
      localStorage.getItem("token");

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default API;