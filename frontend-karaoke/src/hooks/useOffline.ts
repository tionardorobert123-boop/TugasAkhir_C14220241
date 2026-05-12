import { useEffect, useState } from 'react'

import { syncRoomActions }
  from '../lib/sync/syncRoomActions'

export default function useOffline() {

  const [hasInternet,
    setHasInternet] =
      useState(navigator.onLine)

  useEffect(() => {

    const checkInternet =
      async () => {

      // ================= OFFLINE
      if (!navigator.onLine) {

        setHasInternet(false)

        return
      }

      try {

        // PING CLOUD API
        const res = await fetch(
          'https://tugasakhirc14220241.up.railway.app/api/ping'
        )

        if (res.ok) {

          setHasInternet(true)

          console.log(
            '☁️ INTERNET ONLINE'
          )

          // AUTO SYNC
          syncRoomActions()

        } else {

          setHasInternet(false)
        }

      } catch {

        setHasInternet(false)

        console.log(
          '💻 OFFLINE MODE'
        )
      }
    }

    // FIRST CHECK
    checkInternet()

    // INTERVAL CHECK
    const interval =
      setInterval(
        checkInternet,
        5000
      )

    return () =>
      clearInterval(interval)

  }, [])

  return hasInternet
}