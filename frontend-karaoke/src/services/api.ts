import axios from "axios";

const LOCAL_API =
  "http://localhost:8000/api";

const CLOUD_API =
  "https://tugasakhirc14220241.up.railway.app/api";

const API = axios.create({
  timeout: 5000,
});

let currentMode = "";

// ================= CHECK CLOUD
async function getAvailableAPI() {

  try {

    await axios.get(
      `${CLOUD_API}/ping`,
      {
        timeout: 2000
      }
    );

    if (currentMode !== "cloud") {

      console.log(
        "☁️ Switch to CLOUD API"
      );

      currentMode = "cloud";
    }

    return CLOUD_API;

  } catch {

    if (currentMode !== "local") {

      console.log(
        "💻 Switch to LOCAL API"
      );

      currentMode = "local";
    }

    return LOCAL_API;
  }
}

// ================= INTERCEPTOR
API.interceptors.request.use(
  async (config) => {

    const url =
      config.url || "";

    // =================
    // IOT LOCAL ONLY
    // =================

    const isLocalIOT =
      url.includes("/local/rooms");

    if (isLocalIOT) {

      config.baseURL =
        LOCAL_API;

      console.log(
        "📡 LOCAL MQTT API"
      );

    } else {

      // =================
      // AUTO SWITCH
      // =================

      config.baseURL =
        await getAvailableAPI();
    }

    // ================= TOKEN
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