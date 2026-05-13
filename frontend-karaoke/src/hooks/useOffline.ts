import { useEffect, useState } from 'react'

import { syncRoomActions }
  from '../lib/sync/syncRoomActions'

export default function useOffline() {

  const [hasInternet,
    setHasInternet] =
      useState(navigator.onLine)

  useEffect(() => {

    // ================= ONLINE
    const goOnline =
      async () => {

      console.log(
        '☁️ INTERNET ONLINE'
      )

      setHasInternet(true)

      // AUTO SYNC
      await syncRoomActions()
    }

    // ================= OFFLINE
    const goOffline = () => {

      console.log(
        '📴 OFFLINE MODE'
      )

      setHasInternet(false)
    }

    // ================= FIRST CHECK
    if (navigator.onLine) {

      goOnline()

    } else {

      goOffline()
    }

    // ================= EVENT LISTENER
    window.addEventListener(
      'online',
      goOnline
    )

    window.addEventListener(
      'offline',
      goOffline
    )

    return () => {

      window.removeEventListener(
        'online',
        goOnline
      )

      window.removeEventListener(
        'offline',
        goOffline
      )
    }

  }, [])

  return hasInternet
}