const CLOUD_API =
  "https://tugasakhirc14220241.up.railway.app/api";

export async function isCloudOnline() {

  // ================= NO NETWORK
  if (!navigator.onLine) {

    return false;
  }

  try {

    const response = await fetch(

      `${CLOUD_API}/ping`,

      {
        method: 'GET',

        cache: 'no-store',
      }
    );

    return response.ok;

  } catch {

    return false;
  }
}