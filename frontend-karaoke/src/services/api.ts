import axios from "axios";

const LOCAL_API =
  "http://localhost:8000/api";

const CLOUD_API =
  "https://tugasakhirc14220241.up.railway.app/api";

const API = axios.create({
  timeout: 5000,
});

let currentMode = "";

// ================= REAL INTERNET CHECK
export async function hasInternet() {

  try {

    await fetch(
      "https://clients3.google.com/generate_204",
      {
        mode: "no-cors",
      }
    );

    return true;

  } catch {

    return false;
  }
}

// ================= API SWITCH
async function getAvailableAPI() {

  const internet =
    await hasInternet();

  // ================= CLOUD
  if (internet) {

    try {

      await axios.get(
        `${CLOUD_API}/ping`,
        { timeout: 2000 }
      );

      if (currentMode !== "cloud") {

        console.log(
          "☁️ CLOUD API"
        );

        currentMode = "cloud";
      }

      return CLOUD_API;

    } catch {}
  }

  // ================= LOCAL
  if (currentMode !== "local") {

    console.log(
      "📡 LOCAL MQTT API"
    );

    currentMode = "local";
  }

  return LOCAL_API;
}

// ================= INTERCEPTOR
API.interceptors.request.use(
  async (config) => {

    config.baseURL =
      await getAvailableAPI();

    const token =
      localStorage.getItem("token");

    if (token) {

      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  }
);

export default API;