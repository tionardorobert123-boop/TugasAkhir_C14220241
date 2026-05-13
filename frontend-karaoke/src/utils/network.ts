const CLOUD_API =
  'https://tugasakhirc14220241.up.railway.app/api'

export async function isCloudOnline() {

  // ================= NO NETWORK
  if (!navigator.onLine) {

    return false
  }

  const controller =
    new AbortController()

  const timeout =
    setTimeout(() => {

      controller.abort()

    }, 3000)

  try {

    const response = await fetch(

      `${CLOUD_API}/ping`,

      {
        method: 'GET',

        cache: 'no-store',

        signal:
          controller.signal
      }
    )

    clearTimeout(timeout)

    return response.ok

  } catch {

    clearTimeout(timeout)

    return false
  }
}